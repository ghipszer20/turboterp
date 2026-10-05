"use client";

// An instructor's name that opens a summary of their PlanetTerp reviews. Standalone: it only
// needs the name and the URL of that instructor's summary file, and fetches it on first open.
// A popover under the name on desktop, a bottom sheet on phones.

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { loadReviews, reviewsFileUrl, reviewsView, type ReviewsState } from "@/lib/schedule/instructor-reviews";
import { RatingBadge } from "./RatingBadge";
import styles from "./reviews.module.css";

const POPOVER_WIDTH = 340;
const GAP = 8;

export function InstructorReviews({ name, url }: { name: string; url: string }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ReviewsState | "loading">("loading");
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const trigger = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const close = useCallback(() => {
    setOpen(false);
    trigger.current?.focus();
  }, []);

  const toggle = () => {
    if (open) return close();
    const r = trigger.current?.getBoundingClientRect();
    if (r) {
      const left = Math.max(12, Math.min(r.left, window.innerWidth - POPOVER_WIDTH - 12));
      setPos({ top: r.bottom + GAP, left });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open || state !== "loading") return;
    let live = true;
    loadReviews(url).then((s) => live && setState(s));
    return () => {
      live = false;
    };
  }, [open, state, url]);

  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      close();
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panel.current?.contains(t) && !trigger.current?.contains(t)) setOpen(false);
    };
    const onMove = () => setOpen(false);
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerdown", onDown, true);
    window.addEventListener("resize", onMove);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("resize", onMove);
    };
  }, [open, close]);

  // The name can sit inside a clickable row or card; opening reviews must not also pick it.
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  return (
    <>
      <span
        ref={trigger}
        role="button"
        tabIndex={0}
        className={styles.name}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="See PlanetTerp reviews"
        onPointerDown={stop}
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            toggle();
          } else e.stopPropagation();
        }}
      >
        {name}
      </span>
      {open
        ? createPortal(
            <div
              ref={panel}
              role="dialog"
              aria-labelledby={titleId}
              tabIndex={-1}
              className={styles.panel}
              style={pos ? ({ "--top": `${pos.top}px`, "--left": `${pos.left}px` } as React.CSSProperties) : undefined}
              onClick={stop}
            >
              <header className={styles.head}>
                <h2 id={titleId} className={styles.title}>
                  {name}
                </h2>
                <button type="button" className={styles.close} aria-label="Close" onClick={close}>
                  ×
                </button>
              </header>
              {state === "loading" ? <Skeleton /> : state.status === "error" ? <p className={styles.note}>Couldn’t load reviews</p> : <Summary state={state} />}
              <p className={styles.credit}>Reviews from PlanetTerp</p>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function Skeleton() {
  return (
    <div className={styles.skeleton} role="status" aria-label="Loading reviews">
      <i style={{ width: "40%" }} />
      <i style={{ width: "100%" }} />
      <i style={{ width: "100%" }} />
      <i style={{ width: "70%" }} />
    </div>
  );
}

function Summary({ state }: { state: Extract<ReviewsState, { status: "ready" }> }) {
  const s = state.summary;
  const v = reviewsView(s);
  const link = (
    <a className={styles.link} href={v.profileUrl} target="_blank" rel="noopener noreferrer">
      Read all reviews on PlanetTerp
    </a>
  );
  if (v.empty) {
    return (
      <>
        <p className={styles.note}>No reviews on PlanetTerp yet</p>
        {link}
      </>
    );
  }
  return (
    <>
      <p className={styles.overview}>
        <RatingBadge rating={s.averageRating ?? undefined} />
        <span>{v.countLabel}</span>
      </p>
      <ul className={styles.bars} aria-label="Reviews by stars">
        {v.rows.map((r) => (
          <li key={r.stars}>
            <span>{r.stars}★</span>
            <span className={styles.track}>
              <span className={styles.fill} style={{ width: `${r.percent}%` }} />
            </span>
            <span className={styles.n}>{r.count}</span>
          </li>
        ))}
      </ul>
      {s.courses.length ? (
        <p className={styles.courses}>
          <b>Courses reviewed</b> {s.courses.join(", ")}
        </p>
      ) : null}
      <ul className={styles.excerpts}>
        {s.excerpts.map((e, i) => (
          <li key={i}>
            <span className={styles.meta}>
              <span aria-label={`${e.rating} stars`}>{e.rating}★</span>
              {e.course ? <span>{e.course}</span> : null}
              {e.year ? <span>{e.year}</span> : null}
            </span>
            <q>{e.text}</q>
          </li>
        ))}
      </ul>
      {link}
    </>
  );
}

/** Which instructors have a review file, and for which term. Provided by the schedule builder. */
export const ReviewsContext = createContext<{ term: string; names: ReadonlySet<string> } | null>(null);

/** An instructor's name: a reviews button when they have a file, plain text otherwise. */
export function InstructorName({ name }: { name: string }) {
  const ctx = useContext(ReviewsContext);
  if (!ctx || !ctx.names.has(name)) return <>{name}</>;
  return <InstructorReviews name={name} url={reviewsFileUrl(ctx.term, name)} />;
}

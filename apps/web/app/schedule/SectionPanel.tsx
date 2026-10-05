"use client";

import { Fragment, useRef } from "react";
import type { Section } from "@turboterp/course-data/schedules";
import { InstructorName } from "./InstructorReviews";
import type { CourseGrades } from "@turboterp/ratings";
import { courseColor } from "@/lib/schedule/colors";
import {
  bestRating,
  gradeSummary,
  meetingSummary,
  type GradeSummary,
  type SectionChoices,
} from "@/lib/schedule/sections";
import { RatingBadge } from "./RatingBadge";
import cal from "./calendar.module.css";
import styles from "./panel.module.css";

function GradeBar({ summary, loading }: { summary: GradeSummary | null; loading: boolean }) {
  if (loading) return <div className={styles.gradeNone}>Loading grades…</div>;
  if (!summary) return <div className={styles.gradeNone}>No grade data</div>;
  return (
    <div className={styles.grades}>
      <div
        className={styles.gradeBar}
        role="img"
        aria-label={summary.bars.map((b) => `${b.letter} ${Math.round(b.share * 100)}%`).join(", ")}
      >
        {summary.bars.map((b) =>
          b.share > 0 ? (
            <span key={b.letter} data-letter={b.letter} style={{ flexGrow: b.share }} title={`${b.letter} ${Math.round(b.share * 100)}%`}>
              {b.share >= 0.12 ? b.letter : ""}
            </span>
          ) : null,
        )}
      </div>
      <div className={styles.gradeMeta}>
        {summary.gpa !== null ? <b>GPA {summary.gpa.toFixed(2)}</b> : null}
        <span>{summary.students.toLocaleString("en-US")} students</span>
        <span className={styles.gradeLegend}>
          {summary.bars.map((b) => `${b.letter} ${Math.round(b.share * 100)}%`).join(" · ")}
        </span>
      </div>
    </div>
  );
}

/**
 * The section chooser for one class, beside the calendar (a half-height bottom sheet on
 * phones). Hover or focus previews a section as ghost blocks; click commits. On touch the
 * first tap previews and a second tap (or "Switch") commits.
 */
export function SectionPanel({
  courseId,
  title,
  courseIds,
  choices,
  current,
  preview,
  ratings,
  grades,
  overlaps,
  onPreview,
  onCommit,
  onClose,
  onRemove,
}: {
  courseId: string;
  title: string;
  courseIds: string[];
  choices: SectionChoices;
  current: Section | null;
  preview: Section | null;
  ratings: Readonly<Record<string, number>>;
  /** undefined while loading; null when there's no file */
  grades: Record<string, CourseGrades> | null | undefined;
  /** Build my own: the placed courses a section would overlap. */
  overlaps?: (s: Section) => string[];
  onPreview: (s: Section | null) => void;
  onCommit: (s: Section) => void;
  onClose: () => void;
  onRemove?: () => void;
}) {
  const pointer = useRef<string>("mouse");
  // Touch: the section the last tap previewed; tapping it again commits.
  const tapped = useRef<string | null>(null);

  const row = (s: Section) => {
    const isCurrent = current?.id === s.id;
    const isPreview = preview?.id === s.id;
    const clash = overlaps?.(s) ?? [];
    const seats = s.seats.open;
    return (
      <li key={s.id} className={styles.row} data-current={isCurrent || undefined} data-preview={isPreview || undefined}>
        <button
          type="button"
          className={styles.rowMain}
          data-section={s.id}
          aria-current={isCurrent || undefined}
          onPointerDown={(e) => {
            pointer.current = e.pointerType;
          }}
          onKeyDown={() => {
            pointer.current = "keyboard";
          }}
          onMouseEnter={() => {
            if (pointer.current !== "touch") onPreview(isCurrent ? null : s);
          }}
          onFocus={() => onPreview(isCurrent ? null : s)}
          onClick={() => {
            if (isCurrent) return;
            if (pointer.current === "touch" && tapped.current !== s.id) {
              tapped.current = s.id;
              onPreview(s);
            } else {
              tapped.current = null;
              onCommit(s);
            }
          }}
        >
          <span className={styles.rowTop}>
            <b className={styles.sectionId}>{s.id}</b>
            <span className={styles.who}>{s.instructors.length ? s.instructors.map((n, i) => (
                <Fragment key={n}>
                  {i ? ", " : null}
                  <InstructorName name={n} />
                </Fragment>
              )) : "TBA"}</span>
            <RatingBadge rating={bestRating(s, ratings)} />
            <span className={styles.seats} data-low={seats <= 5 || undefined}>
              {seats} open
            </span>
          </span>
          <span className={styles.when}>{meetingSummary(s)}</span>
          {clash.length ? <span className={styles.clash}>Overlaps {clash.join(", ")}</span> : null}
          <GradeBar summary={gradeSummary(grades ?? null, courseId, s.instructors)} loading={grades === undefined} />
        </button>
        {isPreview && !isCurrent ? (
          <button type="button" className={styles.switch} onClick={() => onCommit(s)}>
            {current ? "Switch" : "Place"}
          </button>
        ) : null}
      </li>
    );
  };

  const empty = choices.sameLecture.length + choices.otherLectures.length === 0;
  return (
    <aside className={`${styles.panel} ${cal.course}`} data-color={courseColor(courseIds, courseId)} aria-label={`${courseId} sections`}>
      <div className={styles.head}>
        <span className={styles.headSwatch} />
        <div className={styles.headText}>
          <h3>{courseId} · choose a section</h3>
          <p>{title}</p>
        </div>
        <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className={styles.scroll} onMouseLeave={() => onPreview(null)}>
        {empty ? <p className={styles.none}>Every section of {courseId} is full.</p> : null}
        {choices.sameLecture.length ? (
          <>
            <h4 className={styles.group}>Same lecture, other discussion</h4>
            <ul className={styles.list}>{choices.sameLecture.map(row)}</ul>
          </>
        ) : null}
        {choices.otherLectures.length ? (
          <>
            <h4 className={styles.group}>{current ? "Other lecture times" : "Sections with open seats"}</h4>
            <ul className={styles.list}>{choices.otherLectures.map(row)}</ul>
          </>
        ) : null}
        <p className={styles.source}>Ratings and grades: PlanetTerp. Full sections are hidden.</p>
        {onRemove && current ? (
          <button type="button" className={styles.remove} onClick={onRemove}>
            Take {courseId} off the week
          </button>
        ) : null}
      </div>
    </aside>
  );
}

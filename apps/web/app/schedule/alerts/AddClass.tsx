"use client";

import { useMemo, useState } from "react";
import { searchCourses } from "@/lib/schedule/search";
import { meetingSummary } from "@/lib/schedule/sections";
import { useScheduleData } from "@/lib/schedule/use-schedule-data";
import { findWatch, MAX_WATCHES } from "@/lib/seat-alerts/view";
import type { WatchesState } from "@/lib/seat-alerts/use-watches";
import styles from "./alerts.module.css";

const ERRORS: Record<string, string> = {
  "open-now": "That section has seats right now. Register on Testudo.",
  limit: `You're watching ${MAX_WATCHES} already. Remove one to add another.`,
};

/** Search the current term's classes, then watch one section or any section. */
export function AddClass({ state }: { state: WatchesState }) {
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const data = useScheduleData(course ? [course] : []);
  const courses = data.indexState.status === "ready" ? data.indexState.index.courses : [];
  const results = useMemo(() => (query.trim() ? searchCourses(courses, query, 6) : []), [courses, query]);
  const sections = useMemo(
    () => data.sections.filter((s) => s.courseId === course).sort((a, b) => a.id.localeCompare(b.id)),
    [data.sections, course],
  );
  const watches = state.data.watches;
  const atLimit = watches.length >= MAX_WATCHES;

  const watch = async (sectionId: string | null) => {
    if (!course) return;
    setError(null);
    const problem = await state.add(course, sectionId);
    if (problem) setError(ERRORS[problem] ?? "Couldn't add that watch. Try again.");
  };

  return (
    <section aria-label="Add a class">
      <h2 className={styles.h2}>Add a class</h2>
      <div className={styles.tile}>
        <input
          className={styles.input}
          type="search"
          aria-label="Search classes"
          placeholder={data.indexState.status === "error" || data.indexState.status === "missing" ? "Classes aren't available right now" : "Code or title (e.g. CMSC351)"}
          value={query}
          disabled={data.indexState.status !== "ready"}
          onChange={(e) => (setQuery(e.target.value), setCourse(null), setError(null))}
        />
        {!course && results.length ? (
          <ul className={styles.list}>
            {results.map((c) => (
              <li key={c.id}>
                <button type="button" className={styles.pick} onClick={() => (setCourse(c.id), setQuery(c.id))}>
                  <span className={styles.rowTitle}>{c.id}</span>
                  <span className={styles.rowSub}>{c.title}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {course ? (
          <>
            <button
              type="button"
              className={styles.ghost}
              disabled={atLimit || !!findWatch(watches, course, null)}
              onClick={() => watch(null)}
            >
              {findWatch(watches, course, null) ? `Watching any section of ${course}` : `Any section of ${course}`}
            </button>
            {!data.loaded ? <p className={styles.fine}>Loading sections…</p> : null}
            {data.loaded && !sections.length ? <p className={styles.fine}>No sections this term.</p> : null}
            <ul className={styles.list}>
              {sections.map((s) => {
                const watched = findWatch(watches, s.courseId, s.id);
                return (
                  <li key={s.id} className={styles.row}>
                    <div className={styles.rowText}>
                      <span className={styles.rowTitle}>
                        {s.id} · {s.instructors.join(", ") || "TBA"}
                      </span>
                      <span className={styles.rowSub}>{meetingSummary(s)}</span>
                      <span className={styles.rowSub}>
                        {s.seats.open > 0 ? `${s.seats.open} open` : "Full"} · waitlist {s.seats.waitlist}
                      </span>
                    </div>
                    <div className={styles.rowActions}>
                      {s.seats.open > 0 ? (
                        <a className={`${styles.link} ${styles.open}`} href="https://app.testudo.umd.edu/soc/" target="_blank" rel="noreferrer">
                          Open now: register on Testudo
                        </a>
                      ) : watched ? (
                        <span className={styles.rowSub}>Watching</span>
                      ) : (
                        <button type="button" className={styles.ghost} disabled={atLimit} onClick={() => watch(s.id)}>
                          Notify me
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}

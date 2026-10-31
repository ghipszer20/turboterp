"use client";

import { useMemo, useState } from "react";
import { searchCourses } from "@turboterp/app-core/schedule/search";
import { meetingSummary } from "@turboterp/app-core/schedule/sections";
import { useScheduleData } from "@/lib/schedule/use-schedule-data";
import { findWatch, MAX_WATCHES } from "@/lib/seat-alerts/view";
import type { WatchesState } from "@/lib/seat-alerts/use-watches";
import styles from "./alerts.module.css";

const ERRORS: Record<string, string> = {
  "open-now": "That section has seats right now. Register on Testudo.",
  limit: `You're watching ${MAX_WATCHES} already. Remove one to add another.`,
};

/** Search the current term's classes, then watch one full section or all sections. */
export function AddClass({ state }: { state: WatchesState }) {
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const data = useScheduleData(course ? [course] : []);
  const index = data.indexState.status === "ready" ? data.indexState.index : null;
  const results = useMemo(() => (query.trim() && index ? searchCourses(index.courses, query, 6) : []), [index, query]);
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
            {/* Only worth watching every section while at least one is full (owner, 2026-10-30). */}
            {data.loaded && sections.some((s) => s.seats.open === 0) ? (
              <button
                type="button"
                className={styles.ghost}
                disabled={atLimit || !!findWatch(watches, course, null)}
                onClick={() => watch(null)}
              >
                {findWatch(watches, course, null) ? `Alerts on for all sections of ${course}` : `Alert for all sections of ${course}`}
              </button>
            ) : null}
            {!data.loaded ? <p className={styles.fine}>Loading sections…</p> : null}
            {data.loaded && !sections.length ? <p className={styles.fine}>No sections this term.</p> : null}
            <ul className={styles.list}>
              {sections.map((s) => {
                const watched = findWatch(watches, s.courseId, s.id);
                return (
                  <li key={s.id} className={styles.row}>
                    {/* One fact per line and a short action, so the text keeps the row's width on phones. */}
                    <div className={styles.rowText}>
                      <span className={styles.rowTitle}>Section {s.id}</span>
                      <span className={styles.rowSub}>{s.instructors.join(", ") || "Instructor TBA"}</span>
                      <span className={styles.rowSub}>{meetingSummary(s)}</span>
                      <span className={styles.rowSub}>
                        <span className={s.seats.open > 0 ? styles.open : undefined}>{`${s.seats.open} open`}</span>
                        {` · waitlist ${s.seats.waitlist}`}
                      </span>
                    </div>
                    <div className={styles.rowActions}>
                      {s.seats.open > 0 ? (
                        <a
                          className={`${styles.link} ${styles.open}`}
                          href="https://app.testudo.umd.edu/soc/"
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Section ${s.id} has open seats: register on Testudo`}
                        >
                          Open
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

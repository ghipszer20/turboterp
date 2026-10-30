"use client";

import { useId, useMemo, useState } from "react";
import type { IndexedCourse } from "@turboterp/course-data/schedule-files";
import { courseColor } from "@/lib/schedule/colors";
import { searchWithCatalog } from "@/lib/schedule/search";
import { useCatalog } from "../advisor/data";
import cal from "./calendar.module.css";
import styles from "./builder.module.css";

/**
 * Search courses by code or title; picked courses become removable chips in their block color.
 * Catalog courses with no sections this term show after the term's courses, grayed and not addable.
 */
export function CoursePicker({
  courses,
  picked,
  titles,
  onChange,
  fromPlan,
  elsewhere,
  termName,
}: {
  courses: readonly IndexedCourse[];
  picked: string[];
  titles: Record<string, string>;
  onChange: (courses: string[]) => void;
  /** Course ids the 4-year plan already has in this term ("From your 4-year plan"). */
  fromPlan?: ReadonlySet<string>;
  /** Course id -> other plan terms that also have it ("Also planned for Fall 2027"). */
  elsewhere?: ReadonlyMap<string, string[]>;
  /** "Spring 2027", for "Not offered in Spring 2027". */
  termName?: string | null;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();
  // The catalog loads on the first search, so the page's first load doesn't wait on it.
  const [searched, setSearched] = useState(false);
  const catalogState = useCatalog(searched);
  const catalog = useMemo(() => (catalogState.status === "ready" ? [...catalogState.catalog.values()] : null), [catalogState]);
  const results = useMemo(
    () =>
      searchWithCatalog(courses, catalog, query, 60)
        .filter((r) => !r.offered || !picked.includes(r.course.id))
        .slice(0, 50),
    [courses, catalog, query, picked],
  );
  const activeResult = results[active];
  const titleOf = useMemo(() => new Map(courses.map((c) => [c.id, c.title])), [courses]);

  const add = (id: string) => {
    onChange([...picked, id]);
    setQuery("");
    setActive(0);
  };

  return (
    <div className={styles.picker}>
      <div className={styles.searchWrap}>
        <input
          className={styles.search}
          type="search"
          placeholder="Add a course, e.g. CMSC351 or calculus"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            if (e.target.value.trim()) setSearched(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, results.length - 1));
            else if (e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0));
            else if (e.key === "Enter" && activeResult?.offered) add(activeResult.course.id);
            else if (e.key === "Escape") setQuery("");
            else return;
            e.preventDefault();
          }}
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label="Search courses"
        />
        {results.length > 0 ? (
          <ul className={styles.results} id={listId} role="listbox">
            {results.map((r, i) =>
              r.offered ? (
                <li key={r.course.id} role="option" aria-selected={i === active}>
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => add(r.course.id)}>
                    <b>{r.course.id}</b>
                    <span>{r.course.title}</span>
                    <small>
                      {r.course.credits.min === r.course.credits.max
                        ? r.course.credits.min
                        : `${r.course.credits.min}–${r.course.credits.max}`}{" "}
                      cr · {r.course.sections} {r.course.sections === 1 ? "section" : "sections"}
                    </small>
                  </button>
                </li>
              ) : (
                <li key={r.id} role="option" aria-selected={i === active} aria-disabled="true" className={styles.notOffered}>
                  <div>
                    <b>{r.id}</b>
                    <span>{r.title}</span>
                    <small>
                      Not offered {termName ? `in ${termName}` : "this term"}
                      {r.usually ? ` · ${r.usually}` : ""}
                    </small>
                  </div>
                </li>
              ),
            )}
          </ul>
        ) : null}
      </div>
      {picked.length ? (
        <ul className={styles.chips} aria-label="Your courses">
          {picked.map((id) => {
            const others = elsewhere?.get(id);
            return (
              <li key={id} className={styles.chipCol}>
                <div className={`${styles.courseChip} ${cal.course}`} data-color={courseColor(picked, id)}>
                  <span className={styles.chipSwatch} />
                  <b>{id}</b>
                  <span className={styles.chipTitle}>{titles[id] ?? titleOf.get(id) ?? ""}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${id}`}
                    onClick={() => onChange(picked.filter((c) => c !== id))}
                  >
                    ✕
                  </button>
                </div>
                {fromPlan?.has(id) ? <small className={styles.chipNote}>From your 4-year plan</small> : null}
                {others?.length ? <small className={styles.chipNote}>Also planned for {others.join(", ")}</small> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

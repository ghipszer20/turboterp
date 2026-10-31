// Hooks behind the Schedule tab's first screen: the course index, the department files for the
// courses on screen, and the term's saved course list (same key and format as the web).
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { withCourses } from "@turboterp/app-core/schedule/saved";
import { searchCourses } from "@turboterp/app-core/schedule/search";
import type { SeatsOverlay } from "@turboterp/app-core/schedule/seats-overlay";
import type { CourseIndex, DepartmentSections } from "@turboterp/course-data/schedule-files";
import { savedStore, useSaved } from "./savedStore";
import { createScheduleLoader, ScheduleLoadError, type GradesByCourse } from "./loader";
import { summarizeDepartment, toggleCourse, type CourseRow, type CourseSummary } from "./results";

export const loader = createScheduleLoader((url, init) => fetch(url, init));
const MAX_DEPTS = 8;
const MAX_RESULTS = 50;
const DEBOUNCE_MS = 200;

export function useDebounced<T>(value: T, ms = DEBOUNCE_MS): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export type IndexState =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "offline" }
  | { status: "error" }
  | { status: "ready"; index: CourseIndex };

export function useCourseIndex(): { state: IndexState; reload: () => void } {
  const [state, setState] = useState<IndexState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    loader
      .index()
      .then((index): IndexState => (index ? { status: "ready", index } : { status: "missing" }))
      .catch((e): IndexState => (e instanceof ScheduleLoadError && e.kind === "offline" ? { status: "offline" } : { status: "error" }))
      .then((s) => live && setState(s));
    return () => {
      live = false;
    };
  }, [attempt]);
  return { state, reload: useCallback(() => {
      setState({ status: "loading" });
      setAttempt((n) => n + 1);
    }, []) };
}

/** The term's saved schedule (shared format with the web); adding or removing writes it back at once. */
export function useTermCourses(term: string | null): { courses: string[]; toggle: (id: string) => void } {
  // One store shared with the builder, so plans saved there are never overwritten from here.
  const saved = useSaved(term);
  const toggle = useCallback(
    (id: string) => {
      if (term) savedStore.update(term, (cur) => withCourses(cur, toggleCourse(cur.courses ?? [], id)));
    },
    [term],
  );
  return { courses: saved?.courses ?? [], toggle };
}

type DeptData = { sections: DepartmentSections | null; grades: GradesByCourse | null };

/** Search results with rating, GPA and seat data filled in as each department's files arrive. */
export function useCourseResults(index: CourseIndex | null, query: string): { rows: CourseRow[]; hasQuery: boolean } {
  const term = index?.term ?? null;
  const results = useMemo(() => (index ? searchCourses(index.courses, query, MAX_RESULTS) : []), [index, query]);
  const [seats, setSeats] = useState<SeatsOverlay | null>(null);
  const [depts, setDepts] = useState<Record<string, DeptData>>({});
  const requested = useRef(new Set<string>());

  useEffect(() => {
    if (!term) return;
    let live = true;
    loader
      .seats(term)
      .then((s) => live && setSeats(s))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [term]);

  useEffect(() => {
    if (!term) return;
    const wanted = [...new Set(results.map((c) => c.id.slice(0, 4)))].slice(0, MAX_DEPTS);
    for (const dept of wanted) {
      if (requested.current.has(dept)) continue;
      requested.current.add(dept);
      Promise.all([loader.sections(term, dept).catch(() => null), loader.grades(term, dept).catch(() => null)]).then(([sections, grades]) =>
        setDepts((prev) => ({ ...prev, [dept]: { sections, grades } })),
      );
    }
  }, [term, results]);

  // Per-department summaries are computed once per arrival of data, not per keystroke.
  const summaries = useMemo(() => {
    const out: Record<string, Map<string, CourseSummary>> = {};
    for (const [dept, d] of Object.entries(depts)) if (d.sections) out[dept] = summarizeDepartment(d.sections, d.grades ?? undefined, seats);
    return out;
  }, [depts, seats]);

  const rows = useMemo(
    () => results.map((course) => ({ course, summary: summaries[course.id.slice(0, 4)]?.get(course.id) })),
    [results, summaries],
  );
  return { rows, hasQuery: query.trim().length > 0 };
}

// Hooks behind the schedule builder: the chosen courses' sections (with live seats), grades on
// demand, and the generated layouts (chunked on the device, newest request wins).
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GenerateRequest } from "@turboterp/app-core/schedule/generate";
import { gpasFor } from "@turboterp/app-core/schedule/sections";
import { overlaySeats, type SeatsOverlay } from "@turboterp/app-core/schedule/seats-overlay";
import type { DepartmentSections } from "@turboterp/course-data/schedule-files";
import type { Section } from "@turboterp/course-data/schedules";
import { generateAsync, type AsyncGenerateResult } from "./generation";
import { ScheduleLoadError, type GradesByCourse } from "./loader";
import { loader } from "./useScheduleSearch";

const deptOf = (courseId: string) => courseId.slice(0, 4);

export type BuilderData = {
  sections: Section[];
  ratings: Record<string, number>;
  titles: Record<string, string>;
  restrictions: Record<string, string | null>;
  /** All the chosen courses' department files have arrived (or failed). */
  loaded: boolean;
  failure: "offline" | "error" | null;
  retry: () => void;
  gpas: Record<string, number>;
  /** undefined while loading; null when the department has no file. */
  gradesFor: (courseId: string) => GradesByCourse | null | undefined;
  loadGrades: (courseId: string) => void;
};

export function useBuilderData(term: string | null, courseIds: string[], wantGrades: boolean): BuilderData {
  const [depts, setDepts] = useState<Record<string, DepartmentSections | "missing">>({});
  const [grades, setGrades] = useState<Record<string, GradesByCourse | "missing">>({});
  const [seats, setSeats] = useState<SeatsOverlay | null>(null);
  const [failure, setFailure] = useState<"offline" | "error" | null>(null);
  const [attempt, setAttempt] = useState(0);
  const wanted = useMemo(() => [...new Set(courseIds.map(deptOf))].sort(), [courseIds]);
  const wantedKey = wanted.join(",");

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
  }, [term, attempt]);

  useEffect(() => {
    if (!term) return;
    let live = true;
    for (const dept of wantedKey ? wantedKey.split(",") : []) {
      loader
        .sections(term, dept)
        .then((d) => live && setDepts((prev) => ({ ...prev, [dept]: d ?? "missing" })))
        .catch((e) => {
          if (live) setFailure(e instanceof ScheduleLoadError && e.kind === "offline" ? "offline" : "error");
        });
    }
    return () => {
      live = false;
    };
  }, [term, wantedKey, attempt]);

  const fetchGrades = useCallback(
    (dept: string) => {
      if (!term) return;
      loader
        .grades(term, dept)
        .catch(() => null)
        .then((g) => setGrades((prev) => (prev[dept] ? prev : { ...prev, [dept]: g ?? "missing" })));
    },
    [term],
  );
  const requested = useRef(new Set<string>());
  const loadGrades = useCallback(
    (courseId: string) => {
      const dept = deptOf(courseId);
      if (requested.current.has(dept)) return;
      requested.current.add(dept);
      fetchGrades(dept);
    },
    [fetchGrades],
  );
  useEffect(() => {
    if (wantGrades) for (const d of wantedKey ? wantedKey.split(",") : []) loadGrades(`${d}000`);
  }, [wantGrades, wantedKey, loadGrades]);

  const derived = useMemo(() => {
    const sections: Section[] = [];
    const ratings: Record<string, number> = {};
    const titles: Record<string, string> = {};
    const restrictions: Record<string, string | null> = {};
    const chosen = new Set(courseIds);
    let loaded = true;
    for (const dept of wanted) {
      const d = depts[dept];
      if (!d) {
        loaded = false;
        continue;
      }
      if (d === "missing") continue;
      Object.assign(ratings, d.ratings);
      for (const c of d.courses) {
        titles[c.id] = c.title;
        restrictions[c.id] = c.restriction;
      }
      for (const s of d.sections) if (chosen.has(s.courseId)) sections.push(s);
    }
    return { sections: overlaySeats(sections, seats), ratings, titles, restrictions, loaded };
  }, [depts, wanted, courseIds, seats]);

  const gradesLoaded = !wantGrades || wanted.every((d) => grades[d] !== undefined);
  const gpas = useMemo(() => {
    if (!wantGrades) return {};
    return gpasFor(grades, courseIds);
  }, [wantGrades, grades, courseIds]);
  const gradesFor = useCallback(
    (courseId: string) => {
      const g = grades[deptOf(courseId)];
      return g === undefined ? undefined : g === "missing" ? null : g;
    },
    [grades],
  );
  const retry = useCallback(() => {
    setFailure(null);
    setAttempt((n) => n + 1);
  }, []);

  return { ...derived, loaded: (derived.loaded || failure !== null) && gradesLoaded, failure, retry, gpas, gradesFor, loadGrades };
}

export type Answer = { req: GenerateRequest; result: AsyncGenerateResult };

/** Runs generation after interactions settle; the old answer stays up (`pending`) while a new one is computed. */
export function useLayouts(req: GenerateRequest | null): { shown: Answer | null; pending: boolean } {
  const [answer, setAnswer] = useState<Answer | null>(null);
  useEffect(() => {
    if (!req) return;
    let live = true;
    // A short delay lets a screen transition or a filter tap finish painting before the search starts.
    const timer = setTimeout(() => {
      generateAsync(req, { isCancelled: () => !live }).then((result) => {
        if (live && result) setAnswer({ req, result });
      });
    }, 60);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [req]);
  return { shown: req ? answer : null, pending: req !== null && answer?.req !== req };
}

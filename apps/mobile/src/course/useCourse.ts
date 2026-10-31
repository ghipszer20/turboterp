// Loading for the course screen, the professor screen and the Advisor's course sheet. Everything goes
// through the existing loaders (schedule/loader.ts and advisor/data.ts); nothing here fetches on its own
// except the per-instructor review files, which only the schedule loader's file layout knows about.
import { useCallback, useEffect, useState } from "react";
import type { Section } from "@turboterp/course-data/schedules";
import type { CourseDetails } from "@turboterp/app-core/course-details";
import { loadReviews, reviewsFileUrl, type ReviewsState } from "@turboterp/app-core/schedule/instructor-reviews";
import type { SeatsOverlay } from "@turboterp/app-core/schedule/seats-overlay";
import type { CourseGrades } from "@turboterp/ratings";
import { apiHeaders, apiUrl } from "../config";
import { advisorData } from "../advisor/data";
import { loader } from "../schedule/useScheduleSearch";
import { deptOf } from "./model";

export type Load<T> = { status: "loading" } | { status: "offline" } | { status: "ready"; data: T };

/** Runs `fn` whenever `key` changes; any thrown error is "offline" (the loaders only throw for that). `retry` re-runs. */
export function useLoad<T>(key: string, fn: () => Promise<T>): { state: Load<T>; retry: () => void } {
  const [state, setState] = useState<{ key: string; load: Load<T> } | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    fn().then(
      (data) => live && setState({ key, load: { status: "ready", data } }),
      () => live && setState({ key, load: { status: "offline" } }),
    );
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, tick]);
  const retry = useCallback(() => {
    setState(null);
    setTick((t) => t + 1);
  }, []);
  return { state: state?.key === key ? state.load : { status: "loading" }, retry };
}

export type CourseBasics = {
  title: string | null;
  credits: string | null;
  genEd: string[];
  details: CourseDetails | null;
  grades: CourseGrades | null;
  /** False when the Advisor catalog has no entry for the code. */
  known: boolean;
};

const creditText = (min: number, max: number) => (min === max ? `${min}` : `${min}–${max}`);

/** What the Advisor's sheet needs: catalog facts, description and requirements, course-wide grades. */
export async function loadCourseBasics(id: string): Promise<CourseBasics> {
  const catalog = await advisorData.loadCatalog();
  if (catalog.status === "offline") throw new Error("offline");
  const [details, grades] = await Promise.all([advisorData.loadDetails(id), advisorData.loadGrades(id)]);
  const info = catalog.status === "ready" ? catalog.data.catalog.get(id) : undefined;
  return {
    title: info?.title ?? null,
    credits: info ? creditText(info.credits.min, info.credits.max) : null,
    genEd: info?.genEd ?? [],
    details,
    grades,
    known: !!info,
  };
}

export type CourseSchedule = {
  term: string;
  title: string | null;
  credits: string | null;
  restriction: string | null;
  sections: Section[];
  ratings: Record<string, number>;
  reviewNames: ReadonlySet<string>;
  overlay: SeatsOverlay | null;
  /** By-professor grades for this term's department file, or the Advisor's course-wide file as a fallback. */
  grades: CourseGrades | null;
  /** False when there is no schedule file for the current term. */
  scheduled: boolean;
};

export async function loadCourseSchedule(id: string): Promise<CourseSchedule> {
  const index = await loader.index();
  const empty = { title: null, credits: null, restriction: null, sections: [], ratings: {}, reviewNames: new Set<string>(), overlay: null };
  if (!index) return { term: "", ...empty, grades: await advisorData.loadGrades(id).catch(() => null), scheduled: false };
  const dept = deptOf(id);
  const [dep, overlay, deptGrades] = await Promise.all([
    loader.sections(index.term, dept),
    loader.seats(index.term).catch(() => null),
    loader.grades(index.term, dept).catch(() => null),
  ]);
  const course = dep?.courses.find((c) => c.id === id);
  const sections = dep?.sections.filter((s) => s.courseId === id) ?? [];
  return {
    term: index.term,
    title: course?.title ?? null,
    credits: course ? creditText(course.credits.min, course.credits.max) : null,
    restriction: course?.restriction ?? null,
    sections,
    ratings: dep?.ratings ?? {},
    reviewNames: new Set(dep?.reviews ?? []),
    overlay,
    grades: deptGrades?.[id] ?? (await advisorData.loadGrades(id).catch(() => null)),
    scheduled: sections.length > 0,
  };
}

const reviewCache = new Map<string, Promise<ReviewsState>>();

/** One instructor's PlanetTerp review summary (cached per session; a failure is retried next time). */
export function loadInstructorReviews(term: string, name: string): Promise<ReviewsState> {
  const url = apiUrl(reviewsFileUrl(term, name));
  let p = reviewCache.get(url);
  if (!p) {
    p = loadReviews(url, ((u: string) => fetch(u, { headers: apiHeaders() })) as typeof fetch);
    reviewCache.set(url, p);
    void p.then((s) => s.status === "error" && reviewCache.delete(url));
  }
  return p;
}

/** The current term, or null when the build has no schedule data. */
export async function currentTerm(): Promise<string | null> {
  return (await loader.index())?.term ?? null;
}

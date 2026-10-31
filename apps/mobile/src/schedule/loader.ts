// Loads the schedule builder's pre-built files (packages/course-data/SCHEDULE_FILES.md) from the
// CDN-cached `/api/schedule/...` routes, the same ones the web uses. Each file is fetched once per
// app session; a failed fetch is forgotten so a retry really retries.
import { decodeSeats, type SeatsOverlay } from "@turboterp/app-core/schedule/seats-overlay";
import {
  decodeCourseIndex,
  decodeDepartmentSections,
  type CourseIndex,
  type DepartmentSections,
} from "@turboterp/course-data/schedule-files";
import { decodeDepartment, type CourseGrades } from "@turboterp/ratings";
import { apiHeaders, apiUrl } from "../config";

export type FetchLike = (url: string, init?: { headers?: Record<string, string> }) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}>;

/** `offline` when the request never reached the server; `http` for any other failure. */
export class ScheduleLoadError extends Error {
  constructor(
    readonly kind: "offline" | "http",
    message: string,
  ) {
    super(message);
  }
}

export type GradesByCourse = Record<string, CourseGrades>;

export interface ScheduleLoader {
  /** The current term and its course index; null when the build has no schedule data yet. */
  index(): Promise<CourseIndex | null>;
  seats(term: string): Promise<SeatsOverlay | null>;
  /** null when the department has no file. */
  sections(term: string, dept: string): Promise<DepartmentSections | null>;
  grades(term: string, dept: string): Promise<GradesByCourse | null>;
}

export function createScheduleLoader(
  doFetch: FetchLike,
  urlOf: (path: string) => string = (p) => apiUrl(p),
  headers: Record<string, string> = apiHeaders(),
): ScheduleLoader {
  const cache = new Map<string, Promise<unknown>>();

  async function getJson(path: string): Promise<unknown | null> {
    let res;
    try {
      res = await doFetch(urlOf(path), { headers });
    } catch {
      throw new ScheduleLoadError("offline", `${path}: network request failed`);
    }
    if (res.status === 404) return null;
    if (!res.ok) throw new ScheduleLoadError("http", `${path}: HTTP ${res.status}`);
    return res.json();
  }

  function once<T>(path: string, decode: (data: unknown) => T): Promise<T | null> {
    let p = cache.get(path) as Promise<T | null> | undefined;
    if (!p) {
      p = getJson(path).then((data) => (data === null ? null : decode(data)));
      cache.set(path, p);
      p.catch(() => cache.delete(path));
    }
    return p;
  }

  return {
    async index() {
      const current = (await once("/api/schedule/current", (d) => d as { term?: string })) ?? null;
      if (!current?.term) return null;
      return once(`/api/schedule/${current.term}/index`, decodeCourseIndex);
    },
    seats: (term) => once(`/api/schedule/${term}/seats`, decodeSeats).then((s) => s ?? null),
    sections: (term, dept) => once(`/api/schedule/${term}/sections/${dept}`, decodeDepartmentSections),
    grades: (term, dept) => once(`/api/schedule/${term}/grades/${dept}`, decodeDepartment),
  };
}

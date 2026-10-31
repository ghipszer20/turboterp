// Loads the Advisor's static data (built by scripts/advisor-data.mts and served at /data/advisor/)
// the way the web does, and keeps it in memory for the session. Fetch is injected for tests.
import { decodeCatalogFile } from "@turboterp/plan/catalog-file";
import type { PlanCatalog } from "@turboterp/plan/catalog";
import { decodeDepartment, type CourseGrades } from "@turboterp/ratings";

import { decodeCourseDetails, type CourseDetails } from "@turboterp/app-core/course-details";

type Index = { v: number; term: string; terms?: string[]; catalog: string; details?: string; grades?: string | null };

export type CatalogData = {
  catalog: PlanCatalog;
  term: string;
  terms: string[];
  list: { id: string; title: string; credits: number; genEd: string[] }[];
};

export type CatalogResult = { status: "ready"; data: CatalogData } | { status: "offline" } | { status: "missing" };

type FetchLike = (url: string, init?: { headers?: Record<string, string> }) => Promise<{ ok: boolean; json(): Promise<unknown> }>;

export function createAdvisorData(deps: { fetch: FetchLike; url: (path: string) => string; headers: () => Record<string, string> }) {
  let cached: Promise<CatalogResult> | null = null;
  const getJson = async (path: string) => {
    const res = await deps.fetch(deps.url(`/data/advisor/${path}`), { headers: deps.headers() });
    return res.ok ? res.json() : null;
  };

  async function load(): Promise<CatalogResult> {
    let index: Index | null;
    try {
      index = (await getJson("index.json")) as Index | null;
    } catch {
      return { status: "offline" };
    }
    if (!index) return { status: "missing" };
    try {
      const file = await getJson(index.catalog);
      if (!file) return { status: "missing" };
      const { catalog, term } = decodeCatalogFile(file as Parameters<typeof decodeCatalogFile>[0]);
      const list = [...catalog.values()].map((c) => ({ id: c.id, title: c.title, credits: c.credits.min, genEd: c.genEd }));
      return { status: "ready", data: { catalog, term, terms: index.terms ?? [term], list } };
    } catch {
      return { status: "offline" };
    }
  }

  const gradeFiles = new Map<string, Promise<Record<string, CourseGrades>>>();
  let gradesBase: Promise<string | null> | null = null;
  const detailFiles = new Map<string, Promise<Record<string, CourseDetails>>>();

  return {
    /** A course's description and requirement text as printed, or null when there is none. One department file at a time. */
    async loadDetails(id: string): Promise<CourseDetails | null> {
      const index = (await getJson("index.json").catch(() => null)) as Index | null;
      if (!index?.details) return null;
      const dept = id.replace(/\d.*$/, "");
      if (!detailFiles.has(dept)) {
        detailFiles.set(
          dept,
          getJson(`${index.details}${dept}.json`)
            .then((j) => (j ? decodeCourseDetails(j) : {}))
            .catch(() => ({})),
        );
      }
      return (await detailFiles.get(dept)!)[id] ?? null;
    },
    /** Course-wide grades from PlanetTerp, or null when there is no data. Loaded one department at a time. */
    async loadGrades(id: string): Promise<CourseGrades | null> {
      gradesBase ??= getJson("index.json")
        .then((i) => (i as Index | null)?.grades ?? null)
        .catch(() => null);
      const base = await gradesBase;
      if (!base) return null;
      const dept = id.replace(/\d.*$/, "");
      if (!gradeFiles.has(dept)) {
        gradeFiles.set(
          dept,
          getJson(`${base}${dept}.json`)
            .then((j) => (j ? decodeDepartment(j as Parameters<typeof decodeDepartment>[0]) : {}))
            .catch(() => ({})),
        );
      }
      return (await gradeFiles.get(dept)!)[id] ?? null;
    },
    /** Cached per session; only a successful load is kept, so Retry re-fetches after a failure. */
    loadCatalog(): Promise<CatalogResult> {
      cached ??= load().then((r) => {
        if (r.status !== "ready") cached = null;
        return r;
      });
      return cached;
    },
  };
}

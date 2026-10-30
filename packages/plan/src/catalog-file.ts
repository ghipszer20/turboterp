// The plan catalog as one static JSON file (about 90 KB gzipped for a whole term), so the browser
// gets parsed prerequisites without running the parser. Built offline from a Schedule of Classes
// snapshot; see apps/web/scripts/advisor-data.ts.
//
// Shape (v1): { v: 1, term: "202701", generatedAt, courses: CompactCourse[] }, one entry per
// course with short keys and empty fields left out.

import type { Requirement } from "@turboterp/course-data/prereqs";
import type { Season } from "./check.ts";
import type { CatalogCourse, PlanCatalog } from "./catalog.ts";

export const CATALOG_FILE_VERSION = 1;

export type CompactCourse = {
  /** id, e.g. "CMSC131" */
  i: string;
  /** title */
  t: string;
  /** credits: a number when min = max, else [min, max] */
  c: number | [number, number];
  /** Gen Ed codes */
  g?: string[];
  /** DSNL only with this lab course in the same term, e.g. "CHEM132" */
  nl?: string;
  /** labs usually taken in the same term, e.g. ["BSCI180", "BSCI171"] */
  lb?: string[];
  /** parsed prerequisite */
  p?: Requirement;
  /** parsed corequisite */
  q?: Requirement;
  /** repeatable: a credit limit, or 0 for "repeatable, no stated limit" */
  r?: number;
  /** Twins: f = Renumbered ("Formerly"), x = Cross-listed, co = Credit-only */
  e?: { f?: string[]; x?: string[]; co?: string[] };
  /** seasons offered, as letters: F Fall, W Winter, S Spring, U Summer */
  o?: string;
  /** 1: on none of the current terms' schedules */
  ns?: 1;
};

const SEASON_LETTER: Record<Season, string> = { Fall: "F", Winter: "W", Spring: "S", Summer: "U" };
const LETTER_SEASON = Object.fromEntries(Object.entries(SEASON_LETTER).map(([k, v]) => [v, k as Season])) as Record<string, Season>;

export type CatalogFile = {
  v: typeof CATALOG_FILE_VERSION;
  /** Schedule of Classes term the courses came from, e.g. "202701". */
  term: string;
  generatedAt: string;
  courses: CompactCourse[];
};

export function encodeCatalogFile(catalog: PlanCatalog, meta: { term: string; generatedAt: string }): CatalogFile {
  const courses = [...catalog.values()].map((course): CompactCourse => {
    const { min, max } = course.credits;
    const out: CompactCourse = { i: course.id, t: course.title, c: min === max ? min : [min, max] };
    if (course.genEd.length > 0) out.g = course.genEd;
    if (course.labPair) out.nl = course.labPair.with;
    if (course.labs?.length) out.lb = course.labs;
    if (course.prerequisite) out.p = course.prerequisite;
    if (course.corequisite) out.q = course.corequisite;
    if (course.repeat.kind === "repeatable") out.r = course.repeat.maxCredits ?? 0;
    if (course.offered?.length) out.o = course.offered.map((x) => SEASON_LETTER[x]).join("");
    if (course.notScheduled) out.ns = 1;
    const t = course.twins;
    if (t) {
      out.e = {};
      if (t.renumbered) out.e.f = t.renumbered;
      if (t.crossListed) out.e.x = t.crossListed;
      if (t.creditOnly) out.e.co = t.creditOnly;
    }
    return out;
  });
  return { v: CATALOG_FILE_VERSION, term: meta.term, generatedAt: meta.generatedAt, courses };
}

export function decodeCatalogFile(data: unknown): { term: string; generatedAt: string; catalog: PlanCatalog } {
  const file = data as Partial<CatalogFile> | null;
  if (typeof file !== "object" || file === null || file.v !== CATALOG_FILE_VERSION || !Array.isArray(file.courses)) {
    throw new Error("Unknown plan catalog file version");
  }
  const catalog = new Map<string, CatalogCourse>();
  for (const c of file.courses) {
    const [min, max] = typeof c.c === "number" ? [c.c, c.c] : c.c;
    catalog.set(c.i, {
      id: c.i,
      title: c.t,
      credits: { min, max },
      genEd: c.g ?? [],
      ...(c.nl ? { labPair: { code: "DSNL" as const, with: c.nl } } : {}),
      ...(c.lb?.length ? { labs: c.lb } : {}),
      prerequisite: c.p ?? null,
      corequisite: c.q ?? null,
      repeat: c.r === undefined ? { kind: "unknown" } : c.r === 0 ? { kind: "repeatable" } : { kind: "repeatable", maxCredits: c.r },
      ...(c.ns === 1 ? { notScheduled: true as const } : {}),
      ...(c.o ? { offered: [...c.o].flatMap((l) => (LETTER_SEASON[l] ? [LETTER_SEASON[l]!] : [])) } : {}),
      ...(c.e ? { twins: { ...(c.e.f && { renumbered: c.e.f }), ...(c.e.x && { crossListed: c.e.x }), ...(c.e.co && { creditOnly: c.e.co }) } } : {}),
    });
  }
  return { term: file.term ?? "", generatedAt: file.generatedAt ?? "", catalog };
}

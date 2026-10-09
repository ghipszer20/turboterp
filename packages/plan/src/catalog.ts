// The course facts the plan checker needs, parsed once from Schedule of Classes records so that
// checking a Plan on every edit does no text parsing.

import type { Course } from "@turboterp/course-data";
import { labPairOf } from "@turboterp/course-data/gen-ed";
import { DERIVED_PAIRS, LAB_PAIRS, labsByLecture } from "@turboterp/course-data/lab-pairs";
import { parsePrerequisite, type Requirement } from "@turboterp/course-data/prereqs";
import type { Season } from "./check.ts";
import { parseCourseTwins, type Twins } from "./twins.ts";

/**
 * Whether a course may be taken again for credit. Testudo states it only for some courses
 * ("Repeatable to 6 credits if content differs"); it never says a course is NOT repeatable,
 * so "unknown" is the usual case.
 */
export type Repeatability = { kind: "unknown" } | { kind: "repeatable"; maxCredits?: number };

export type CatalogCourse = {
  id: string;
  title: string;
  credits: { min: number; max: number };
  genEd: string[];
  /** DSNL only when taken with this lab, in the same term: Testudo's "DSNL (if taken with CHEM132)". */
  labPair?: { code: "DSNL"; with: string };
  /** Labs usually taken in the same term as this lecture, current lab first, e.g. ["BSCI180", "BSCI171"]. */
  labs?: string[];
  prerequisite: Requirement | null;
  corequisite: Requirement | null;
  repeat: Repeatability;
  /** Renumbered, Cross-listed and Credit-only Twins, as this course's own Testudo lines name them
   * (twinsOf gives the symmetric view). Left out when there are none. */
  twins?: Twins;
  /** Seasons this course appeared in across the cached Schedule of Classes terms. Left out when the
   * course came from no dated term. */
  offered?: Season[];
};

export type PlanCatalog = ReadonlyMap<string, CatalogCourse>;

// Phrasings seen in the Spring 2027 snapshot. Bare "repeat" is not enough: GVPT390 teaches
// "repeated games" and STAT741 "repeated measures".
const REPEAT_WITH_LIMIT = [/\brepeatable to (\d+) credits?/i, /\bmay (?:be )?repeat(?:ed)?\b[^.]*?\bmaximum of (\d+) credits?/i];
const REPEAT_NO_LIMIT = [/\bthe course is repeatable\b/i, /\bmay be repeated\b/i];

function repeatability(course: Course): Repeatability {
  const text = [course.description, ...Object.values(course.texts.other)].join("\n");
  for (const pattern of REPEAT_WITH_LIMIT) {
    const m = pattern.exec(text);
    if (m) return { kind: "repeatable", maxCredits: Number(m[1]) };
  }
  return REPEAT_NO_LIMIT.some((p) => p.test(text)) ? { kind: "repeatable" } : { kind: "unknown" };
}

/**
 * One catalog from one or more terms' Schedule of Classes courses. A term's snapshot lists only
 * the courses offered that term, so pass several terms to know more courses; when a course
 * appears more than once, the first record wins.
 */
export function buildCatalog(...lists: Course[][]): PlanCatalog {
  const catalog = new Map<string, CatalogCourse>();
  const labs = labsByLecture(lists.flat(), [...DERIVED_PAIRS, ...LAB_PAIRS]);
  for (const course of lists.flat()) {
    if (catalog.has(course.id)) continue;
    const { twins } = parseCourseTwins(course);
    catalog.set(course.id, {
      id: course.id,
      title: course.title,
      credits: course.credits,
      genEd: course.genEd,
      // Snapshots parsed before the labPair field still carry the text it comes from.
      ...(course.labPair ? { labPair: course.labPair } : labPairOf(course.genEdText ?? "")),
      ...(labs.get(course.id)?.length ? { labs: labs.get(course.id)! } : {}),
      prerequisite: parsePrerequisite(course.texts.prerequisite),
      corequisite: parsePrerequisite(course.texts.corequisite),
      repeat: repeatability(course),
      ...(Object.keys(twins).length > 0 ? { twins } : {}),
    });
  }
  return catalog;
}

const SEASON_BY_MONTH: Record<string, Season> = { "01": "Spring", "05": "Summer", "08": "Fall", "12": "Winter" };
const SEASON_ORDER: Season[] = ["Fall", "Winter", "Spring", "Summer"];

/** The season of a Testudo term code (YYYYMM): month 01 Spring, 05 Summer, 08 Fall, 12 Winter. */
export function seasonOfTerm(term: string): Season | undefined {
  return SEASON_BY_MONTH[term.slice(4, 6)];
}

/** A copy of the catalog with each course's `offered` seasons, from the terms whose snapshots list it. */
export function withOfferings(catalog: PlanCatalog, snapshots: { term: string; courses: { id: string }[] }[]): PlanCatalog {
  const seen = new Map<string, Set<Season>>();
  for (const { term, courses } of snapshots) {
    const season = seasonOfTerm(term);
    if (!season) continue;
    for (const { id } of courses) {
      if (!seen.has(id)) seen.set(id, new Set());
      seen.get(id)!.add(season);
    }
  }
  const out = new Map<string, CatalogCourse>();
  for (const [id, course] of catalog) {
    const seasons = seen.get(id);
    out.set(id, seasons ? { ...course, offered: SEASON_ORDER.filter((s) => seasons.has(s)) } : course);
  }
  return out;
}

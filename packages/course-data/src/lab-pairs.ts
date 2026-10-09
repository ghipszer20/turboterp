// Which lab goes with which lecture, for the plan checker's lab-missing and lecture-missing
// warnings (docs/project/lab-pairs.md). Links come from Testudo and UMD catalog text: a
// corequisite between a lab and a lecture, or "DSNL (if taken with X)". DERIVED_PAIRS holds those
// found in sources the app doesn't load (past terms, the catalogs); LAB_PAIRS adds the ones the
// text doesn't state outright. STANDALONE_LABS and STANDALONE_RULES list labs with no lecture.
// `npm run lab-coverage -w @turboterp/course-data` lists any lab in none of these.

import { labPairOf } from "./gen-ed.ts";
import * as al from "./lab-pairs-a-l.ts";
import { DERIVED_PAIRS } from "./lab-pairs.generated.ts";
import * as mz from "./lab-pairs-m-z.ts";
import type { Course } from "./soc.ts";

export type LabSourceCourse = Course & { labOnly?: boolean };
export type LabPair = { lecture: string; labs: string[]; source: string };
export type StandaloneLab = { id: string; reason: string; source: string };
/** Marks lab-only courses standalone by id prefix ("ARTT", "KNES1"). */
export type StandaloneRule = { prefix: string; reason: string; source: string };

export const LAB_PAIRS: LabPair[] = [...al.PAIRS, ...mz.PAIRS];
export const STANDALONE_LABS: StandaloneLab[] = [...al.STANDALONE, ...mz.STANDALONE];
export const STANDALONE_RULES: StandaloneRule[] = [...al.RULES, ...mz.RULES];
export { DERIVED_PAIRS };

const LAB_TITLE = /\blab(oratory)?\b/i;
const CODE = /[A-Z]{4}\d{3}[A-Z]?/g;

/** A lab course: "Lab" or "Laboratory" as a word in its title, or only lab meetings. */
export const isLabCourse = (c: { title: string; labOnly?: boolean }): boolean => LAB_TITLE.test(c.title) || c.labOnly === true;

/** The lab itself, or a one-letter section variant of it (CHEM132S for CHEM132). */
export function sameOrVariant(id: string, lab: string): boolean {
  return id === lab || (id.length === lab.length + 1 && id.startsWith(lab) && /[A-Z]$/.test(id));
}

/** The bulk rule covering a lab-only course whose title doesn't say lab. */
export function ruleFor(c: { id: string; title: string; labOnly?: boolean }, rules: readonly StandaloneRule[] = STANDALONE_RULES): StandaloneRule | undefined {
  if (!c.labOnly || LAB_TITLE.test(c.title)) return undefined;
  return rules.find((r) => c.id.startsWith(r.prefix));
}

/** Each lecture's labs: from corequisites, DSNL pairs, then `pairs`; labs in `courses` first. */
export function labsByLecture(courses: readonly LabSourceCourse[], pairs: readonly LabPair[] = []): Map<string, string[]> {
  const byId = new Map(courses.map((c) => [c.id, c]));
  const out = new Map<string, string[]>();
  const add = (lecture: string, lab: string) => {
    const labs = out.get(lecture) ?? [];
    if (lab !== lecture && !labs.includes(lab)) labs.push(lab);
    out.set(lecture, labs);
  };
  for (const c of courses) {
    const pair = c.labPair ?? labPairOf(c.genEdText ?? "").labPair;
    if (pair) add(c.id, pair.with);
    for (const id of c.texts.corequisite?.match(CODE) ?? []) {
      const other = byId.get(id);
      if (!other) continue;
      if (isLabCourse(c) && !isLabCourse(other)) add(other.id, c.id);
      else if (!isLabCourse(c) && isLabCourse(other)) add(c.id, other.id);
    }
  }
  for (const p of pairs) for (const lab of p.labs) add(p.lecture, lab);
  for (const [lecture, labs] of out) out.set(lecture, [...labs.filter((l) => byId.has(l)), ...labs.filter((l) => !byId.has(l))]);
  return out;
}

/** Lab courses that are neither some lecture's lab (or a variant of one), standalone, nor ruled standalone. */
export function unclassifiedLabs(
  courses: readonly LabSourceCourse[],
  opts: { pairs?: readonly LabPair[]; standalone?: readonly StandaloneLab[]; rules?: readonly StandaloneRule[] } = {},
): LabSourceCourse[] {
  const paired = [...labsByLecture(courses, opts.pairs ?? [...DERIVED_PAIRS, ...LAB_PAIRS]).values()].flat();
  const alone = new Set((opts.standalone ?? STANDALONE_LABS).map((s) => s.id));
  const rules = opts.rules ?? STANDALONE_RULES;
  const seen = new Set<string>();
  return courses.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return isLabCourse(c) && !alone.has(c.id) && !ruleFor(c, rules) && !paired.some((lab) => sameOrVariant(c.id, lab));
  });
}

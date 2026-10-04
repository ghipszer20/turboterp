// The Programs a student can pick -- every entry in the program registry (@turboterp/programs;
// only Verified Programs will ship) -- plus the Requirement Layers every student gets: Gen Ed and
// the university rules. The options carry metadata only; a Program's requirements load with
// import() when it's audited (runAnalysis, runWhatIf), so the picker never bundles them.

import type { Program } from "@turboterp/audit";
import { collegeIntro } from "@turboterp/audit/programs/college-intro.ts";
import { genEd, university } from "@turboterp/audit/programs/gen-ed-2026-27.ts";
import type { College } from "@turboterp/plan/credit-caps";
import type { Degree } from "@turboterp/plan/degrees";
import type { ProgramCandidate } from "@turboterp/plan/notices";
import { MAJOR_COURSE_SETS } from "@turboterp/programs/course-sets";
import type { DegreeChoice } from "./plan-state";
import { blockedReason, findProgram, loadPrograms, majorKey, PROGRAMS, type ProgramEntry } from "@turboterp/programs";

export type ProgramOption = ProgramEntry;

/** Majors, then minors, certificates and special programs, each major's default track first. */
export const PROGRAM_OPTIONS: ProgramOption[] = PROGRAMS;

/** The Audit's one-line notice for a saved program a chosen major closes (ProgramMeta.notOpenTo;
 * added before the major, or saved by an older version), so it isn't shown as a normal program. */
export function blockedNotice(programId: string, selected: readonly string[]): string | undefined {
  const entry = findProgram(programId);
  const reason = entry && blockedReason(entry, selected);
  return reason === undefined ? undefined : `${reason} Remove it in Edit setup.`;
}

/** Every student is checked against these too. */
export const AUTOMATIC_PROGRAMS: Program[] = [genEd, university];

export const CATALOG_YEARS = ["2026-27"] as const;

/** Adds or removes a program. Picking another track of a chosen major replaces it in place. */
export function toggleProgram(selected: string[], id: string): string[] {
  const picked = findProgram(id);
  if (!picked) return selected;
  if (selected.includes(id)) return selected.filter((x) => x !== id);
  const key = majorKey(picked);
  const sameMajor = selected.findIndex((x) => {
    const o = findProgram(x);
    return o !== undefined && majorKey(o) === key;
  });
  if (sameMajor >= 0) return selected.map((x, i) => (i === sameMajor ? id : x));
  return [...selected, id];
}

const chosen = (selected: string[]) => selected.map(findProgram).filter((o): o is ProgramOption => o !== undefined);

/** The chosen programs alone (majors, minors, special programs), without Gen Ed or the university
 * rules -- what a what-if comparison calls "current" or "proposed" (its `layers` are always
 * AUTOMATIC_PROGRAMS). */
export function majorPrograms(selected: string[]): Promise<Program[]> {
  return loadPrograms(chosen(selected).map((o) => o.id));
}

/** The chosen programs, then Gen Ed and the university rules. */
export async function auditedPrograms(selected: string[]): Promise<Program[]> {
  return [...(await majorPrograms(selected)), ...AUTOMATIC_PROGRAMS];
}

/** The college requirement layer(s) for a plan: the college's intro course, for freshman entrants
 * only. The college is the plan's, or the one derived from its programs. */
export function collegeLayers(plan: { programs: string[]; college?: College; entry?: "freshman" | "transfer" }): Program[] {
  const college = plan.college ?? collegeOf(plan.programs);
  const layer = college ? collegeIntro(college, plan.entry) : null;
  return layer ? [layer] : [];
}

/** An undeclared major only clears the double-major notice pre-filter when at least this share of
 * the plan's courses appear in its listed courses (course-sets.generated.ts). The audit
 * (HiGHS-backed) is the expensive step, so this needs to run cheaply against every major in the
 * registry -- a plain set intersection, no Program load. The owner may retune this. */
export const NOTICE_OVERLAP_THRESHOLD = 0.3;

/** At most this many undeclared majors get audited for a double-major notice, even if more clear
 * NOTICE_OVERLAP_THRESHOLD -- with ~100 majors in the registry, auditing every match would still
 * be too many HiGHS runs per analysis. */
export const MAX_NOTICE_CANDIDATES = 5;

function overlapShare(planCourseIds: readonly string[], courseSet: readonly string[] | undefined): number {
  if (!courseSet?.length || planCourseIds.length === 0) return 0;
  const set = new Set(courseSet);
  return planCourseIds.filter((id) => set.has(id)).length / planCourseIds.length;
}

/**
 * Which undeclared majors are worth auditing for a double-major notice: those where the plan's
 * courses overlap enough with the major's own listed courses (courseSets, keyed by major id --
 * MAJOR_COURSE_SETS in production), best overlap first, capped at MAX_NOTICE_CANDIDATES. Exported
 * so the threshold and cap can be tested against synthetic majors, without the real registry
 * needing ~100 entries to exercise the cap.
 */
export function rankNoticeCandidates(
  options: readonly ProgramOption[],
  planCourseIds: readonly string[],
  courseSets: Record<string, readonly string[]> = MAJOR_COURSE_SETS,
): ProgramOption[] {
  return options
    .map((o) => ({ o, share: overlapShare(planCourseIds, courseSets[o.id]) }))
    .filter((x) => x.share >= NOTICE_OVERLAP_THRESHOLD)
    .sort((a, b) => b.share - a.share)
    .slice(0, MAX_NOTICE_CANDIDATES)
    .map((x) => x.o);
}

/**
 * Majors for the double-major / dual-degree notices: the chosen majors (declared, in order), then
 * the default track of each major the student hasn't chosen -- pre-filtered by rankNoticeCandidates
 * against the plan's own courses (planCourseIds), so only majors worth auditing get loaded and run
 * through the (HiGHS-backed) audit. Another track of a chosen major is never a candidate, since two
 * tracks of one major aren't a double major; minors and special programs never take part.
 *
 * `options` and `courseSets` default to the real registry and MAJOR_COURSE_SETS; a test can pass
 * synthetic ones instead, so this doesn't need the real registry to hold ~100 majors to exercise
 * ranking and the MAX_NOTICE_CANDIDATES cap (rankNoticeCandidates's own tests do the same).
 */
export async function noticeCandidates(
  selected: string[],
  planCourseIds: readonly string[] = [],
  options: readonly ProgramOption[] = PROGRAM_OPTIONS,
  courseSets: Record<string, readonly string[]> = MAJOR_COURSE_SETS,
): Promise<ProgramCandidate[]> {
  const byId = new Map(options.map((o) => [o.id, o]));
  const mine = selected.map((id) => byId.get(id)).filter((o): o is ProgramOption => o !== undefined && o.kind === "major");
  if (mine.length === 0) return [];
  const majors = new Set(mine.map(majorKey));
  const others: ProgramOption[] = [];
  for (const o of options) {
    if (o.kind !== "major" || majors.has(majorKey(o))) continue;
    majors.add(majorKey(o));
    others.push(o);
  }
  const filtered = rankNoticeCandidates(others, planCourseIds, courseSets);
  const [declared, undeclared] = await Promise.all([Promise.all(mine.map((o) => o.load())), Promise.all(filtered.map((o) => o.load()))]);
  return [...declared.map((program) => ({ program, declared: true })), ...undeclared.map((program) => ({ program, declared: false }))];
}

/** Double major vs double degree, with two or more majors chosen (the stored choice, a double
 * major by default); null with fewer, where the choice doesn't apply. */
export function degreeModeOf(selected: string[], stored: DegreeChoice | undefined): DegreeChoice | null {
  return chosen(selected).filter((o) => o.kind === "major").length >= 2 ? (stored ?? "double-major") : null;
}

/**
 * The student's Degrees for checkDegrees (@turboterp/plan/degrees): one degree holding every
 * chosen program for a double major (or a single major), or one degree per major for a double
 * degree, with minors and special programs in the first. The Advisor doesn't know which programs
 * are officially declared yet, so every one is "planned" (the declaration-deadline note shows).
 * College rules aren't encoded yet, so no degree has any.
 */
export async function studentDegrees(selected: string[], mode: DegreeChoice | null): Promise<Degree[]> {
  const options = chosen(selected);
  const programs = await loadPrograms(options.map((o) => o.id));
  const entries = options.map((o, i) => ({ program: programs[i]!, kind: o.kind, status: "planned" as const }));
  const majors = entries.filter((e) => e.kind === "major");
  if (mode !== "double-degree" || majors.length < 2) return [{ programs: entries }];
  const others = entries.filter((e) => e.kind !== "major");
  return majors.map((m, i) => ({ programs: i === 0 ? [m, ...others] : [m] }));
}

/** The Advisor's default college: the first declared major's college, in the order chosen (or the
 * first program's, with no major). Undefined with nothing chosen (or only unknown ids); the
 * student can pick a different one in setup ("College" in SetupView), stored on the plan and never
 * recomputed once set. */
export function collegeOf(selected: string[]): College | undefined {
  const mine = chosen(selected);
  return (mine.find((o) => o.kind === "major") ?? mine[0])?.college;
}

export function programsLabel(selected: string[]): string {
  const names = chosen(selected).map((o) => o.short ?? o.name);
  return names.length ? names.join(" + ") : "No program chosen";
}

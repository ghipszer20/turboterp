// The slower half of the Advisor: the degree audit (HiGHS), double-major / dual-degree notices
// and the CS gateway. Loaded with import() and run after edits settle, never on every keystroke.

import { auditPrograms, checkCsGateway, PROGRAM_GPA_ID, type GatewayResult, type Program, type Requirement, type RequirementResult } from "@turboterp/audit";
import type { CreditCourse } from "@turboterp/credit";
import type { PlanCatalog } from "@turboterp/plan/catalog";
import type { Plan } from "@turboterp/plan/check";
import { checkDegrees, type DegreeCheck } from "@turboterp/plan/degrees";
import { planCourses, programNotices, type ProgramNotice } from "@turboterp/plan/notices";
// The heavy, solver-backed half of @turboterp/tracks (checkTrack calls auditProgram); this file is
// already loaded with import() (see AdvisorApp.tsx), so it's fine for it to pull in HiGHS, the way
// it already pulls in @turboterp/audit's auditPrograms/checkCsGateway above. Never import this
// module, or "@turboterp/tracks" itself, from a file in the main bundle -- use
// "@turboterp/tracks/list" (lib/advisor/tracks.ts) there instead.
import {
  checkTrack,
  scienceGpa,
  TRACKS,
  trackMilestoneTimings,
  trackProgram,
  type GradedCourse,
  type MilestoneTiming,
  type ScienceGpa,
  type Track,
  type TrackCheckResult,
} from "@turboterp/tracks";
import { checkerPlan } from "./checker";
import type { AdvisorPlan } from "./plan-state";
import { AUTOMATIC_PROGRAMS, auditedPrograms, collegeLayers, degreeModeOf, noticeCandidates, studentDegrees } from "./programs";
import { choiceAwardsOf, computePriorCredit } from "./prior-credit";
import { describeGap, type Gap } from "./requirements";
import { matriculationTermId } from "./terms";
import { resolvedPlan } from "./track-plan";

type ProgramAudit = {
  program: Program;
  requirements: { requirement: Requirement; result: RequirementResult; gap: Gap | null }[];
  /** The program-wide GPA check (Program.minGpa), shown after the requirements; null without one. */
  gpa: RequirementResult | null;
  /** Rows shown: the requirements, plus the GPA check if any. */
  total: number;
  satisfied: number;
};

/** A chosen Track's audit, plain-language issues and requirement status -- never a degree
 * requirement (owner ruling): built alongside the major audits above, but from its own
 * trackProgram, and never fed into auditedPrograms or noticeCandidates. */
type TrackAudit = {
  track: Track;
  result: TrackCheckResult;
  requirements: { requirement: Requirement; result: RequirementResult; gap: Gap | null }[];
  satisfied: number;
  /** Each milestone's timing on the plan's own timeline (see trackMilestoneTimings). */
  milestones: MilestoneTiming[];
};

export type Analysis = {
  notices: ProgramNotice[];
  /** Double major / double degree check (two or more majors chosen), else null. */
  degrees: DegreeCheck | null;
  audits: ProgramAudit[];
  /** Only when the Computer Science major is chosen. */
  gateway: GatewayResult | null;
  /** Every chosen pre-professional track (plan.tracks), in the order TRACKS lists them. */
  tracks: TrackAudit[];
  /** BCPM science GPA over every graded course (every attempt counts, unlike the audit's courses,
   * which count a repeated course once): meaningful for the health tracks, meaningless for pre-law. */
  scienceGpa: ScienceGpa;
  /** Courses the Advisor picked for exam awards the student left unpicked, by award source. Empty when none. */
  autoChoices: Record<string, string>;
  /** Audit passes run: 1 unless an award needed a choice tried each way. */
  auditRuns: number;
  /** Milliseconds the audit and notices took. */
  ms: number;
};

/** Every graded course, prior credit and term courses, keeping every attempt of a repeat (AMCAS
 * and LSAC count each one; @turboterp/plan/notices' planCourses counts a course once, so it can't
 * be reused here). */
function gradedCourses(plan: Plan): GradedCourse[] {
  const prior = (plan.priorCredit ?? []).filter((c) => c.grade).map((c) => ({ id: c.id, credits: c.credits, grade: c.grade }));
  const term = plan.terms.flatMap((t) => t.courses.filter((c) => c.grade).map((c) => ({ id: c.id, credits: c.credits ?? 0, grade: c.grade })));
  return [...prior, ...term];
}

/** Most combinations of unpicked choice awards tried (each is one audit run); past it, extra awards keep the shared-codes placeholder. */
const MAX_COMBINATIONS = 8;

type Pass = Awaited<ReturnType<typeof auditPass>>;

/** One full audit of the plan with these prior-credit courses: notices, degrees and each program's result. */
async function auditPass(input: { plan: AdvisorPlan; catalog: PlanCatalog }, priorCourses: CreditCourse[], programs: Program[], layers: Program[]) {
  const plan = checkerPlan(input.plan, priorCourses);
  const courses = planCourses(plan, input.catalog);
  const candidates = await noticeCandidates(
    input.plan.programs,
    courses.map((c) => c.id),
  );
  const mode = degreeModeOf(input.plan.programs, input.plan.degreeMode);
  const [solveResults, notices, degrees] = await Promise.all([
    // With two or more majors, checkDegrees below already solves every program (with degree
    // groups and the 18-unique goal); reuse its audits instead of a second, disagreeing solve.
    mode ? null : auditPrograms(programs, courses, { confirmed: input.plan.confirmedSlots ?? [] }),
    programNotices(plan, input.catalog, candidates, mode),
    mode ? studentDegrees(input.plan.programs, mode).then((d) => checkDegrees(plan, input.catalog, d, [...AUTOMATIC_PROGRAMS, ...layers], { today: new Date(), confirmed: input.plan.confirmedSlots ?? [] })) : null,
  ]);
  // Match by program id, not position: checkDegrees' own entries are laid out layers-first
  // (Gen Ed, university, then each degree's programs), while the Audit tab expects chosen
  // programs first, then Gen Ed and the university layers -- the order `programs` is already in.
  const results = degrees ? programs.map((p) => degrees.audits.find((a) => a.program.id === p.id)!.result) : solveResults!;
  return { plan, courses, notices, degrees, results };
}

/** Requirements satisfied across every program, then total courses assigned (progress). */
function scoreOf(pass: Pass): [number, number] {
  const all = pass.results.flatMap((r) => r.requirements);
  return [all.filter((r) => r.status === "satisfied").length, all.reduce((t, r) => t + r.assigned.length, 0)];
}

/** Every combination of one option per award, the chart's first option varying slowest and tried first. */
function combinations(awards: { source: string; options: string[] }[]): Record<string, string>[] {
  return awards.reduce<Record<string, string>[]>((acc, a) => acc.flatMap((c) => a.options.map((o) => ({ ...c, [a.source]: o }))), [{}]);
}

export async function runAnalysis(input: { plan: AdvisorPlan; catalog: PlanCatalog; priorCourses: CreditCourse[] }): Promise<Analysis> {
  const t = performance.now();
  const layers = collegeLayers(input.plan);
  const programs = await auditedPrograms(input.plan.programs).then((ps) => [...ps, ...layers]);
  const genEdOf = (id: string) => input.catalog.get(id)?.genEd ?? [];

  // Awards offering a choice of courses that the student hasn't picked: the Advisor picks the
  // combination that satisfies the most requirements across every program (ties: more progress,
  // then the chart's first option). Most students have none, so this is one audit run.
  const unpicked: { source: string; options: string[] }[] = [];
  for (const e of computePriorCredit(input.plan.prior, genEdOf).entries)
    for (const earn of e.earns)
      if (earn.kind === "choice" && !earn.picked && unpicked.length < 4 && combinations([...unpicked, { source: e.source, options: earn.options.map((o) => o.id) }]).length <= MAX_COMBINATIONS)
        unpicked.push({ source: e.source, options: earn.options.map((o) => o.id) });

  let best: { pass: Pass; auto: Record<string, string>; score: [number, number] } | null = null;
  let auditRuns = 0;
  for (const auto of unpicked.length ? combinations(unpicked) : [{}]) {
    const courses = unpicked.length ? computePriorCredit(input.plan.prior, genEdOf, auto).courses : input.priorCourses;
    const pass = await auditPass(input, courses, programs, layers);
    auditRuns++;
    const score = scoreOf(pass);
    if (!best || score[0] > best.score[0] || (score[0] === best.score[0] && score[1] > best.score[1])) best = { pass, auto, score };
  }
  const { plan, courses, notices, degrees, results } = best!.pass;
  const autoChoices = best!.auto;
  const choiceAwards = choiceAwardsOf(computePriorCredit(input.plan.prior, genEdOf, autoChoices).entries);
  const catalogList = [...input.catalog.values()].map((c) => ({ id: c.id, genEd: c.genEd }));
  const gapContext = { courses, catalog: catalogList, choiceAwards };
  const audits = programs.map((program, p): ProgramAudit => {
    const requirements = program.requirements.map((requirement, r) => {
      const result = results[p]!.requirements[r]!;
      return { requirement, result, gap: describeGap(requirement, result, gapContext) };
    });
    const gpa = results[p]!.requirements.find((x) => x.id === PROGRAM_GPA_ID) ?? null;
    const satisfied = requirements.filter((x) => x.result.status === "satisfied").length + (gpa?.status === "satisfied" ? 1 : 0);
    return { program, requirements, gpa, total: requirements.length + (gpa ? 1 : 0), satisfied };
  });

  const term = matriculationTermId(input.plan.startTerm);
  const gateway =
    input.plan.programs.includes("cmsc-major") && term
      ? checkCsGateway({ matriculationTerm: term, courses, ...(input.plan.gpa !== undefined ? { cumulativeGpa: input.plan.gpa } : {}) })
      : null;

  const chosenTrackIds = new Set(input.plan.tracks ?? []);
  const chosenTracks = TRACKS.filter((track) => chosenTrackIds.has(track.id));
  const trackPlan = resolvedPlan(plan, input.catalog);
  const tracks = await Promise.all(
    chosenTracks.map(async (track): Promise<TrackAudit> => {
      const result = await checkTrack(trackPlan, track, {
        ...(input.plan.examTerms ? { examTerms: input.plan.examTerms } : {}),
        ...(track.gpaProtection && input.plan.expectedGrades ? { expectedGrades: input.plan.expectedGrades } : {}),
      });
      const program = trackProgram(track);
      const requirements = program.requirements.map((requirement, r) => {
        const reqResult = result.audit.requirements[r]!;
        return { requirement, result: reqResult, gap: describeGap(requirement, reqResult, gapContext) };
      });
      return {
        track,
        result,
        requirements,
        satisfied: requirements.filter((x) => x.result.status === "satisfied").length,
        milestones: trackMilestoneTimings(trackPlan, track),
      };
    }),
  );

  return { notices, degrees, audits, gateway, tracks, autoChoices, auditRuns, scienceGpa: scienceGpa(gradedCourses(trackPlan)), ms: performance.now() - t };
}

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
import { describeGap, type ChoiceAward, type Gap } from "./requirements";
import { matriculationTermId } from "./terms";
import { displayStatus, type DisplayStatus } from "./req-status";
import { resolvedPlan } from "./track-plan";

type ProgramAudit = {
  program: Program;
  requirements: { requirement: Requirement; result: RequirementResult; display: DisplayStatus; gap: Gap | null }[];
  /** The program-wide GPA check (Program.minGpa), shown after the requirements; null without one. */
  gpa: RequirementResult | null;
  /** Rows shown: the requirements, plus the GPA check if any. */
  total: number;
  /** Fully satisfied rows only (every counted course completed). */
  satisfied: number;
  /** Rows the audit calls satisfied that still count a planned course. */
  inProgress: number;
};

/** A chosen Track's audit, plain-language issues and requirement status -- never a degree
 * requirement (owner ruling): built alongside the major audits above, but from its own
 * trackProgram, and never fed into auditedPrograms or noticeCandidates. */
type TrackAudit = {
  track: Track;
  result: TrackCheckResult;
  requirements: { requirement: Requirement; result: RequirementResult; display: DisplayStatus; gap: Gap | null }[];
  satisfied: number;
  inProgress: number;
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

export async function runAnalysis(input: { plan: AdvisorPlan; catalog: PlanCatalog; priorCourses: CreditCourse[]; choiceAwards?: ChoiceAward[] }): Promise<Analysis> {
  const t = performance.now();
  const plan = checkerPlan(input.plan, input.priorCourses);
  const courses = planCourses(plan, input.catalog);
  const layers = collegeLayers(input.plan);
  const [programs, candidates] = await Promise.all([
    auditedPrograms(input.plan.programs).then((ps) => [...ps, ...layers]),
    noticeCandidates(
      input.plan.programs,
      courses.map((c) => c.id),
    ),
  ]);
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
  const catalogList = [...input.catalog.values()].map((c) => ({ id: c.id, genEd: c.genEd }));
  const gapContext = { courses, catalog: catalogList, choiceAwards: input.choiceAwards ?? [] };
  const audits = programs.map((program, p): ProgramAudit => {
    const requirements = program.requirements.map((requirement, r) => {
      const result = results[p]!.requirements[r]!;
      return { requirement, result, display: displayStatus(result, courses), gap: describeGap(requirement, result, gapContext) };
    });
    const gpa = results[p]!.requirements.find((x) => x.id === PROGRAM_GPA_ID) ?? null;
    const satisfied = requirements.filter((x) => x.display === "satisfied").length + (gpa?.status === "satisfied" ? 1 : 0);
    const inProgress = requirements.filter((x) => x.display === "in-progress").length;
    return { program, requirements, gpa, total: requirements.length + (gpa ? 1 : 0), satisfied, inProgress };
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
        return { requirement, result: reqResult, display: displayStatus(reqResult, courses), gap: describeGap(requirement, reqResult, gapContext) };
      });
      return {
        track,
        result,
        requirements,
        satisfied: requirements.filter((x) => x.display === "satisfied").length,
        inProgress: requirements.filter((x) => x.display === "in-progress").length,
        milestones: trackMilestoneTimings(trackPlan, track),
      };
    }),
  );

  return { notices, degrees, audits, gateway, tracks, scienceGpa: scienceGpa(gradedCourses(trackPlan)), ms: performance.now() - t };
}

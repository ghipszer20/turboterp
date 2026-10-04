// Adapter for the semester-difficulty scorer (@turboterp/plan/difficulty): turns PlanetTerp grade
// distributions and the plan's completed grades into the scorer's plain inputs.

import { gradePoints } from "@turboterp/audit";
import { termDifficulty, type DifficultyCourse, type DifficultyHistory, type DifficultyStats, type TermDifficulty } from "@turboterp/plan/difficulty";
import type { CourseGrades, Distribution } from "@turboterp/ratings";
import type { AdvisorPlan } from "./plan-state";

export const NO_TRANSCRIPT_NOTE = "Import your transcript for a personal estimate.";

/** Average GPA plus the W and F shares of every student; null when there is nothing to go on. */
export function statsFromDistribution(d: Distribution | null | undefined): DifficultyStats | null {
  if (!d || d.students <= 0) return null;
  return { averageGpa: d.averageGpa, wRate: d.counts.W / d.students, fRate: d.counts.F / d.students };
}

/**
 * Difficulty for every term that still has work in it (fully completed terms are left out).
 * `load` fetches a course's PlanetTerp grades (loadCourseGrades in the app).
 */
export async function planDifficulty(
  plan: AdvisorPlan,
  creditsOf: (id: string, own?: number) => number | null,
  load: (id: string) => Promise<CourseGrades | null>,
): Promise<Map<string, TermDifficulty>> {
  const cache = new Map<string, Promise<DifficultyStats | null>>();
  const stats = (id: string) => {
    if (!cache.has(id)) cache.set(id, load(id).then((g) => statsFromDistribution(g?.overall)).catch(() => null));
    return cache.get(id)!;
  };

  const history: DifficultyHistory[] = [];
  for (const term of plan.terms)
    for (const c of term.courses) {
      if (c.status !== "completed" || gradePoints(c.grade) === undefined) continue;
      const s = await stats(c.id);
      if (s?.averageGpa != null) history.push({ id: c.id, grade: c.grade!, courseAverageGpa: s.averageGpa });
    }

  const out = new Map<string, TermDifficulty>();
  for (const term of plan.terms) {
    if (term.courses.length === 0 || term.courses.every((c) => c.status === "completed")) continue;
    const courses: DifficultyCourse[] = [];
    for (const c of term.courses) {
      const credits = creditsOf(c.id, c.credits);
      if (credits !== null) courses.push({ id: c.id, credits, stats: await stats(c.id) });
    }
    if (courses.length === 0) continue;
    const r = termDifficulty(courses, history);
    out.set(term.name, r.personalized ? r : { ...r, sentence: `${r.sentence} ${NO_TRANSCRIPT_NOTE}` });
  }
  return out;
}

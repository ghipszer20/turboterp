// One gallery generation: every distinct layout for the chosen courses under the filters,
// sorted, plus the shared time scale and (when empty) the explanation. Runs in a Web Worker
// (generate.worker.ts) so the page never freezes; plain function so it's testable.

import { explainNoLayouts, type EmptyExplanation } from "@turboterp/course-data/explain";
import { generateLayouts, sectionPasses, type ScheduleFilters, type Section } from "@turboterp/course-data/schedules";
import { sortLayouts, type SortKey } from "@turboterp/course-data/sort";
import { timeScale, type TimeScale } from "./calendar";
import { encodeLayouts, type EncodedLayouts } from "./gallery";

export type GenerateRequest = {
  courseIds: string[];
  sections: Section[];
  filters: ScheduleFilters;
  sort: SortKey;
  ratings: Record<string, number>;
  /** Average GPA per instructor and course (`gpaKey`); only used by the "recommended" sort. */
  gpas?: Record<string, number>;
};

export type GenerateResult = {
  layouts: EncodedLayouts;
  scale: TimeScale;
  explanation: EmptyExplanation | null;
  ms: number;
};

export function runGeneration(req: GenerateRequest): GenerateResult {
  const t0 = performance.now();
  const chosen = new Set(req.courseIds);
  const passing = req.sections.filter((s) => chosen.has(s.courseId) && sectionPasses(s, req.filters));
  const scale = timeScale(passing.flatMap((s) => s.meetings));
  if (req.courseIds.length === 0) {
    return { layouts: encodeLayouts([], []), scale, explanation: null, ms: performance.now() - t0 };
  }
  const layouts = sortLayouts([...generateLayouts(req.courseIds, req.sections, req.filters)], req.sort, {
    ratings: req.ratings,
    gpas: req.gpas,
  });
  const explanation = layouts.length === 0 ? explainNoLayouts(req.courseIds, req.sections, req.filters) : null;
  return { layouts: encodeLayouts(req.courseIds, layouts), scale, explanation, ms: performance.now() - t0 };
}

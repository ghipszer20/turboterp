// Schedule generation on the device. The web runs `runGeneration` in a Web Worker; React Native
// has no worker for plain app code, so the search itself is chunked: the layout generator is
// advanced for a small time budget, then control is handed back to the event loop so touches,
// scrolling and animations keep running. Sorting and encoding (fast next to the search) run in
// one go at the end. Same inputs and outputs as app-core's `runGeneration`.
import { explainNoLayouts } from "@turboterp/course-data/explain";
import { generateLayouts, sectionPasses, type Layout } from "@turboterp/course-data/schedules";
import { sortLayouts } from "@turboterp/course-data/sort";
import { timeScale } from "@turboterp/app-core/schedule/calendar";
import { encodeLayouts } from "@turboterp/app-core/schedule/gallery";
import type { GenerateRequest, GenerateResult } from "@turboterp/app-core/schedule/generate";

/**
 * Safety cap on collected layouts (the web has none: it only windows what it renders). Six heavy
 * courses can reach hundreds of thousands; past this the list is cut and `truncated` is set.
 */
export const MAX_LAYOUTS = 200_000;

export type GenerationOptions = {
  /** How long to search before yielding, in ms. */
  budgetMs?: number;
  /** Hands control back to the event loop; default is a macrotask. */
  yieldFn?: () => Promise<void>;
  now?: () => number;
  isCancelled?: () => boolean;
  maxLayouts?: number;
};

export type AsyncGenerateResult = GenerateResult & { truncated: boolean };

const macrotask = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/** null when cancelled (a newer request replaced this one). */
export async function generateAsync(req: GenerateRequest, o: GenerationOptions = {}): Promise<AsyncGenerateResult | null> {
  const now = o.now ?? (() => performance.now());
  const yieldFn = o.yieldFn ?? macrotask;
  const budget = o.budgetMs ?? 12;
  const cap = o.maxLayouts ?? MAX_LAYOUTS;
  const t0 = now();
  const chosen = new Set(req.courseIds);
  const passing = req.sections.filter((s) => chosen.has(s.courseId) && sectionPasses(s, req.filters));
  const scale = timeScale(passing.flatMap((s) => s.meetings));
  if (req.courseIds.length === 0) {
    return { layouts: encodeLayouts([], []), scale, explanation: null, ms: now() - t0, truncated: false };
  }
  const found: Layout[] = [];
  let truncated = false;
  const it = generateLayouts(req.courseIds, req.sections, req.filters);
  for (;;) {
    const sliceEnd = now() + budget;
    let done = false;
    // The clock is read every 16 layouts so it isn't the hot path.
    for (let n = 0; ; n++) {
      const next = it.next();
      if (next.done) {
        done = true;
        break;
      }
      found.push(next.value);
      if (found.length >= cap) {
        truncated = true;
        done = true;
        break;
      }
      if (n % 16 === 15 && now() >= sliceEnd) break;
    }
    if (done) break;
    await yieldFn();
    if (o.isCancelled?.()) return null;
  }
  if (o.isCancelled?.()) return null;
  const layouts = sortLayouts(found, req.sort, { ratings: req.ratings, gpas: req.gpas });
  const explanation = layouts.length === 0 ? explainNoLayouts(req.courseIds, req.sections, req.filters) : null;
  return { layouts: encodeLayouts(req.courseIds, layouts), scale, explanation, ms: now() - t0, truncated };
}

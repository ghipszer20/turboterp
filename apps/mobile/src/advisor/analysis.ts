// The program analysis (audit, category colors, program checks, Explore comparison). The solver
// runs in the engine bridge (src/engine, apps/mobile/bridge), never in the app: this file builds the
// jobs, shares one debounced controller per screen family, and exposes hooks. The plan grid, the
// Audit screen and Explore all read the same controllers, so one plan edit costs one audit.
import { useEffect, useSyncExternalStore } from "react";
import { Platform } from "react-native";
import type { Analysis } from "@turboterp/app-core/analysis";
import type { AdvisorPlan } from "@turboterp/app-core/plan-state";
import { computePriorCredit } from "@turboterp/app-core/prior-credit";
import type { WhatIfResult } from "@turboterp/app-core/what-if";
import type { CatalogData } from "./data-core";
import { useCatalog } from "./data";
import { createJobController, type JobState } from "./job-controller";
import { useAdvisorPlan } from "./store";
import { engine } from "../engine/EngineHost";
import type { AuditInput } from "../engine/protocol";

/** The engine is a WebView; the web export (screenshots only) has none. */
export const ENGINE_AVAILABLE = Platform.OS !== "web";

const entriesCache = new WeakMap<object, AuditInput["catalog"]>();
function catalogEntries(data: CatalogData): AuditInput["catalog"] {
  let entries = entriesCache.get(data.catalog);
  if (!entries) {
    entries = [...data.catalog.entries()];
    entriesCache.set(data.catalog, entries);
  }
  return entries;
}

/** The audit job's input: the plan, the catalog, and the courses the plan's prior credit earns. */
export function buildAuditInput(plan: AdvisorPlan, data: CatalogData): AuditInput {
  const priorCourses = computePriorCredit(plan.prior, (id) => data.catalog.get(id)?.genEd ?? []).courses;
  return { plan, catalog: catalogEntries(data), priorCourses };
}

type AnalysisRequest = { plan: AdvisorPlan; data: CatalogData };

export const analysisController = createJobController<AnalysisRequest, Analysis>({
  run: ({ plan, data }) => engine.run({ type: "audit", input: buildAuditInput(plan, data) }),
  delayMs: 400,
  available: ENGINE_AVAILABLE,
  keyOf: ({ plan, data }) => `${data.term}|${JSON.stringify(plan)}`,
});

type WhatIfRequest = AnalysisRequest & { proposed: string[] };

export const whatIfController = createJobController<WhatIfRequest, WhatIfResult>({
  run: ({ plan, data, proposed }) => engine.run({ type: "whatIf", input: { ...buildAuditInput(plan, data), proposed } }),
  delayMs: 350,
  available: ENGINE_AVAILABLE,
  keyOf: ({ plan, data, proposed }) => `${data.term}|${proposed.join(",")}|${JSON.stringify(plan)}`,
});

function useController<T>(c: { get(): JobState<T>; subscribe(l: () => void): () => void }): JobState<T> {
  return useSyncExternalStore(c.subscribe, c.get, c.get);
}

/** Starts (and keeps current) the audit for the saved plan; returns the full state. */
export function useAnalysisState(): JobState<Analysis> & { retry: () => void } {
  const plan = useAdvisorPlan();
  const { result } = useCatalog();
  const data = result?.status === "ready" ? result.data : null;
  useEffect(() => {
    analysisController.request(plan && data ? { plan, data } : null);
  }, [plan, data]);
  return { ...useController(analysisController), retry: analysisController.retry };
}

/** The last finished analysis, or null: what the plan grid needs for category colors and program checks. */
export function useAnalysis(): Analysis | null {
  return useAnalysisState().result;
}

/** Explore: the saved plan against `proposed` (null: nothing to compare). */
export function useWhatIf(proposed: string[] | null): JobState<WhatIfResult> & { retry: () => void } {
  const plan = useAdvisorPlan();
  const { result } = useCatalog();
  const data = result?.status === "ready" ? result.data : null;
  const key = proposed?.join(",") ?? null;
  useEffect(() => {
    whatIfController.request(plan && data && proposed ? { plan, data, proposed } : null);
    // `proposed` is tracked through `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, data, key]);
  return { ...useController(whatIfController), retry: whatIfController.retry };
}

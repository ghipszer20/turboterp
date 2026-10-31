// The program analysis (audit, category colors, program checks) is not available in the app yet:
// app-core's analysis pulls the program registry, whose loaders are Node-only, so the app can't
// import it directly (see scripts/check-import-graph.mjs). The audit engine (WebView bridge)
// will provide it; until then the plan grid shows checks without program colors. This is the one
// place to wire it in: it will take the plan, catalog and prior-credit courses.
import type { Analysis } from "@turboterp/app-core/analysis";

export function useAnalysis(): Analysis | null {
  return null;
}

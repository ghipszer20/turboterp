// Guardrail (docs/project/scaling-plan.md, Task 5): every page is built ahead of time; only these API
// routes run on each request. A page that starts rendering per visit, or a new per-request API route,
// fails the build (scripts/check-per-visit.mts, run as "postbuild") until it's added here on purpose.

export const PER_VISIT_ALLOWED: readonly string[] = [
  "/api/access",
  "/api/account/delete",
  "/api/consent",
  "/api/cron/[job]",
  "/api/dining",
  "/api/dining/search",
  "/api/email/plan",
  "/api/report",
  "/api/schedule/[...path]",
  "/api/seat-alerts/device",
  "/api/seat-alerts/watches",
  "/api/seat-alerts/watches/[id]",
  "/api/seat-alerts/watches/[id]/done",
];

/** Routes that render on every request but aren't allowed to. */
export function unexpectedPerVisit(allRoutes: readonly string[], prerendered: readonly string[]): string[] {
  const built = new Set(prerendered);
  const allowed = new Set(PER_VISIT_ALLOWED);
  return [...new Set(allRoutes)].filter((r) => !built.has(r) && !allowed.has(r)).sort();
}

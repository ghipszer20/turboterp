// Runs as apps/web's "postbuild": fails the build if a route renders on every request without being
// on the allow-list in lib/per-visit-routes.ts (Vercel bills each of those requests as a function call).

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { unexpectedPerVisit } from "../lib/per-visit-routes.ts";

const next = join(import.meta.dirname, "..", ".next");
const read = (file: string) => JSON.parse(readFileSync(join(next, file), "utf8"));

const allRoutes = Object.values(read("app-path-routes-manifest.json") as Record<string, string>);
const prerendered = Object.keys((read("prerender-manifest.json") as { routes: Record<string, unknown> }).routes);
const bad = unexpectedPerVisit(allRoutes, prerendered);

if (bad.length > 0) {
  console.error(`These routes render on every visit:\n  ${bad.join("\n  ")}`);
  console.error("Make them static (no connection(), cookies(), headers() or force-dynamic in pages), or, for a");
  console.error("per-request API route, add it to PER_VISIT_ALLOWED in lib/per-visit-routes.ts on purpose.");
  process.exit(1);
}
console.log(`Per-visit check: ${allRoutes.length} routes, all pages built ahead of time.`);

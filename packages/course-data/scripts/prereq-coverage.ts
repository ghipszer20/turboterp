// Measures how much of a term's real prerequisite text the parser understands.
//
//   node scripts/prereq-coverage.ts [202701]
//
// A prerequisite counts as "clean" when every course code in the text ends up
// either as a course in the tree or inside a manual item on purpose (placement),
// and the tree isn't just one manual blob that swallowed course codes.
// The detector logic lives in ../src/prereq-audit.ts (shared with prereq-audit.ts).

import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { detectClasses, lostCodes, treeCourses } from "../src/prereq-audit.ts";
import type { Requirement } from "../src/prereqs.ts";
import type { Course } from "../src/soc.ts";

// PARSER=<path to another prereqs.ts> measures that parser instead (before/after comparisons).
const { parsePrerequisite } = (await import(process.env.PARSER ? pathToFileURL(process.env.PARSER).href : "../src/prereqs.ts")) as {
  parsePrerequisite: (t: string | null) => Requirement | null;
};
const term = process.argv[2] ?? "202701";
const { courses } = JSON.parse(readFileSync(`.cache/soc-${term}.json`, "utf8")) as { courses: Course[] };

const withPrereq = courses.filter((c) => c.texts.prerequisite);
let clean = 0;
let manualOnly = 0;
const problems: { id: string; text: string; lost: string[] }[] = [];

for (const c of withPrereq) {
  const text = c.texts.prerequisite!;
  const tree = parsePrerequisite(text);
  if (!tree) {
    problems.push({ id: c.id, text, lost: ["(nothing parsed)"] });
    continue;
  }
  const lost = lostCodes(text, tree);
  if (treeCourses(tree).size === 0) manualOnly++;
  if (lost.length === 0) clean++;
  else problems.push({ id: c.id, text, lost });
}

const pct = (n: number) => `${((100 * n) / withPrereq.length).toFixed(1)}%`;
console.log(`Term ${term}: ${courses.length} courses, ${withPrereq.length} with prerequisites`);
console.log(`Clean: ${clean} (${pct(clean)})   manual-only: ${manualOnly} (${pct(manualOnly)})   problems: ${problems.length}`);
for (const p of problems.slice(0, Number(process.env.SHOW ?? 25))) {
  console.log(`\n${p.id}: ${p.text}\n   → ${p.lost.join(", ")}`);
}

// ---- invented-requirement detectors (classes A-H, see detectClasses) ----
const classes: Record<string, { id: string; why: string }[]> = { A: [], B: [], C: [], D: [], E: [], F: [], H: [] };
for (const c of withPrereq) {
  const text = c.texts.prerequisite!;
  const tree = parsePrerequisite(text);
  if (!tree) continue;
  for (const f of detectClasses(text, tree)) classes[f.cls]!.push({ id: c.id, why: f.why });
}

const counts = Object.entries(classes).map(([k, v]) => `${k}=${new Set(v.map((x) => x.id)).size}`);
console.log(`\nInvented-requirement classes (courses affected): ${counts.join("  ")}`);
for (const [k, list] of Object.entries(classes)) {
  for (const e of list.slice(0, Number(process.env.SHOW_CLASS ?? 3))) console.log(`  ${k} ${e.id}: ${e.why}`);
}

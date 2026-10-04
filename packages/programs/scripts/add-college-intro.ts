// Puts each college's intro course (docs/project/college-intro-courses.md) into the first fall
// term of every major's sample plan that lacks it (owner ruling 2026-09-29). Idempotent. Minor,
// certificate and special-program plans hold only that program's courses and may belong to a
// student in any college, so they're left alone.
//
// Run `npx tsx scripts/add-college-intro.ts [--dry]` from packages/programs. A plan whose first
// term isn't a first-year fall, or whose first fall would go over the college's credit cap, is
// left alone and listed.

import { creditCap } from "@turboterp/plan/credit-caps";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { PROGRAMS } from "../src/registry.ts";

const INTRO: Record<string, { id: string; credits: number }> = {
  CMNS: { id: "CMNS100", credits: 1 },
  ARHU: { id: "ARHU158", credits: 3 },
  SPHL: { id: "UNIV100", credits: 1 },
  INFO: { id: "INST101", credits: 1 },
  BSOS: { id: "UNIV100", credits: 1 },
  EDUC: { id: "UNIV100", credits: 1 },
  ENGR: { id: "UNIV100", credits: 1 },
  ARCH: { id: "UNIV100", credits: 1 },
  AGNR: { id: "UNIV100", credits: 1 },
  UGST: { id: "UNIV100", credits: 1 },
};
/** Colleges whose own course replaces a UNIV100 already in the plan. */
const REPLACES_UNIV100 = new Set(["CMNS100", "ARHU158", "INST101"]);
const FIRST_FALL = /^(Term 1|Fall 1|Year 1 Fall|Freshman Fall|First Year Fall)$/;
const GEN_ED_SLOT = /^(GENED|GEN-ED|ELECTIVE|FILLER)/i;

type Plan = { credits?: Record<string, number>; terms: { term: string; courses: string[] }[] };

const inline = (v: unknown): string =>
  Array.isArray(v)
    ? `[${v.map(inline).join(", ")}]`
    : v && typeof v === "object"
      ? `{ ${Object.entries(v).map(([k, x]) => `${JSON.stringify(k)}: ${inline(x)}`).join(", ")} }`
      : JSON.stringify(v);

/** The sample plans' own layout (one line per term, inline credits map), so an edit is a small diff. */
function format(plan: Plan): string {
  const lines = Object.entries(plan).map(([k, v]) => {
    const key = `  ${JSON.stringify(k)}: `;
    if (k === "notes" && Array.isArray(v)) return `${key}[\n${v.map((n) => `    ${JSON.stringify(n)}`).join(",\n")}\n  ]`;
    if (k === "terms" && Array.isArray(v)) return `${key}[\n${v.map((t) => `    ${inline(t)}`).join(",\n")}\n  ]`;
    return key + inline(v);
  });
  return `{\n${lines.join(",\n")}\n}`;
}

const dry = process.argv.includes("--dry");
const edited: string[] = [];
const skipped: string[] = [];
let already = 0;

for (const entry of PROGRAMS) {
  if (entry.kind !== "major") continue;
  const path = fileURLToPath(new URL(`../sample-plans/${entry.id}.json`, import.meta.url));
  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    continue;
  }
  const intro = INTRO[entry.college];
  if (!intro) continue;
  const plan = JSON.parse(raw) as Plan;
  const first = plan.terms[0];
  if (!first || !FIRST_FALL.test(first.term)) {
    skipped.push(`${entry.id}: first term "${first?.term}" is not a first-year fall`);
    continue;
  }
  if (first.courses.includes(intro.id) || (intro.id === "CMNS100" && first.courses.includes("UNIV100"))) {
    already++;
    continue;
  }
  if (plan.terms.some((t) => t.courses.includes(intro.id))) {
    skipped.push(`${entry.id}: ${intro.id} is already in a later term`);
    continue;
  }
  const credits = (id: string) => plan.credits?.[id] ?? 3;
  const swap = REPLACES_UNIV100.has(intro.id) ? first.courses.indexOf("UNIV100") : -1;
  const courses = [...first.courses];
  if (swap >= 0) courses[swap] = intro.id;
  else courses.push(intro.id);
  const cap = creditCap(entry.college, "Fall").max;
  const total = () => courses.reduce((t, id) => t + (id === intro.id ? intro.credits : credits(id)), 0);
  while (total() > cap) {
    const drop = courses.findIndex((id) => GEN_ED_SLOT.test(id));
    if (drop < 0) break;
    courses.splice(drop, 1);
  }
  if (total() > cap) {
    skipped.push(`${entry.id}: first fall would be ${total()} credits, over the ${entry.college} cap of ${cap}`);
    continue;
  }
  first.courses = courses;
  if (intro.credits !== 3) plan.credits = { ...plan.credits, [intro.id]: intro.credits };
  const eol = raw.includes("\r\n") ? "\r\n" : "\n";
  if (!dry) writeFileSync(path, format(plan).replace(/\n/g, eol) + (raw.endsWith("\n") ? eol : ""));
  edited.push(entry.id);
}

console.log(`${dry ? "would edit" : "edited"} ${edited.length}, already had it ${already}, skipped ${skipped.length}`);
for (const s of skipped) console.log("SKIP", s);

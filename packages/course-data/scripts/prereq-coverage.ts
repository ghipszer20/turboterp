// Measures how much of a term's real prerequisite text the parser understands.
//
//   node scripts/prereq-coverage.ts [202701]
//
// A prerequisite counts as "clean" when every course code in the text ends up
// either as a course in the tree or inside a manual item on purpose (placement),
// and the tree isn't just one manual blob that swallowed course codes.

import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import type { Requirement } from "../src/prereqs.ts";
import type { Course } from "../src/soc.ts";

// PARSER=<path to another prereqs.ts> measures that parser instead (before/after comparisons).
const { parsePrerequisite } = (await import(process.env.PARSER ? pathToFileURL(process.env.PARSER).href : "../src/prereqs.ts")) as {
  parsePrerequisite: (t: string | null) => Requirement | null;
};
const EXCLUDED = /\((?:not|excluding|except)\b[^)]*\)/gi;
const term = process.argv[2] ?? "202701";
const { courses } = JSON.parse(readFileSync(`.cache/soc-${term}.json`, "utf8")) as { courses: Course[] };

const CODE = /\b[A-Z]{4}\s?\d{3}[A-Z]?\b/g;
const codesIn = (s: string) => new Set((s.match(CODE) ?? []).map((c) => c.replace(/\s/, "")));

function treeCourses(r: Requirement, out = new Set<string>()): Set<string> {
  if (r.kind === "course") out.add(r.course);
  else if (r.kind === "dept-level") out.add(`${r.dept}${r.minNumber}+`);
  else if (r.kind === "all" || r.kind === "any") r.of.forEach((x) => treeCourses(x, out));
  return out;
}
function manualTexts(r: Requirement, out: string[] = []): string[] {
  if (r.kind === "manual") out.push(r.text);
  else if (r.kind === "all" || r.kind === "any") r.of.forEach((x) => manualTexts(x, out));
  return out;
}

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
  const inTree = treeCourses(tree);
  const manual = manualTexts(tree).join(" ");
  const lost = [...codesIn(text)].filter((code) => !inTree.has(code) && !codesIn(manual).has(code));
  const swallowed = [...codesIn(manual.replace(EXCLUDED, " "))].filter((code) => !/eligibility|placement/i.test(manual) && !inTree.has(code));
  if (inTree.size === 0) manualOnly++;
  if (lost.length === 0 && swallowed.length === 0) clean++;
  else problems.push({ id: c.id, text, lost: [...lost, ...swallowed.map((s) => `${s} (in manual)`)] });
}

const pct = (n: number) => `${((100 * n) / withPrereq.length).toFixed(1)}%`;
console.log(`Term ${term}: ${courses.length} courses, ${withPrereq.length} with prerequisites`);
console.log(`Clean: ${clean} (${pct(clean)})   manual-only: ${manualOnly} (${pct(manualOnly)})   problems: ${problems.length}`);
for (const p of problems.slice(0, Number(process.env.SHOW ?? 25))) {
  console.log(`\n${p.id}: ${p.text}\n   → ${p.lost.join(", ")}`);
}

// ---- invented-requirement detectors ----
// Each class lists courses whose tree still shows a known parsing mistake.
//   A waiver clause whose course codes end up as requirements
//   B excluded course (in "(not … MATH461)") ends up as a requirement
//   C slash or bare-number shorthand not read as separate courses / alternatives
//   D course is both a direct "all" leaf and inside a sibling "any"
//   E grade phrase in a clause, but one of its courses has no minimum grade
//   F "or equivalent/comparable …" with no manual alternative in the tree
//   H "one of the following" list that is not an "any"

const WAIVER = /\bstudents? who (?:have taken|do not meet)\b[\s\S]*\bmay (?:contact|request)\b|\bcomparable (?:content|experience)\b/i;
const EXCLUSION = /\((?:not|excluding|except)\b[^)]*\)/gi;
const GRADE =
  /\b[A-D][+-]? or (?:higher|better)\b|\b[Mm]inimum (?:grade )?(?:of )?(?:an? )?[A-D][+-]?(?![A-Za-z0-9])|\b[Gg]rades? of [A-D]|with (?:an? )?[A-D][+-]? or/;

function leaves(r: Requirement, out: Extract<Requirement, { kind: "course" }>[] = []) {
  if (r.kind === "course") out.push(r);
  else if (r.kind === "all" || r.kind === "any") r.of.forEach((x) => leaves(x, out));
  return out;
}
function nodesOfKind(r: Requirement, kind: "all" | "any", out: Requirement[] = []) {
  if (r.kind === kind) out.push(r);
  if (r.kind === "all" || r.kind === "any") r.of.forEach((x) => nodesOfKind(x, kind, out));
  return out;
}

/** Codes written as "MATH461, 478", "BSCI 331 and 332" or "CHEM131/271", expanded. */
function shorthandCodes(text: string): { codes: string[]; slashPairs: [string, string][] } {
  const codes: string[] = [];
  const slashPairs: [string, string][] = [];
  const re = /\b([A-Z]{4})\s?(\d{3}[A-Z]?)((?:\s*(?:\/|,|and|or)\s*(?:[A-Z]{4}\s?)?\d{3}[A-Z]?(?![-\w]))*)/g;
  for (const m of text.matchAll(re)) {
    const dept = m[1]!;
    let prev = `${dept}${m[2]}`;
    for (const x of m[3]!.matchAll(/(\/|,|and|or)\s*(?:([A-Z]{4})\s?)?(\d{3}[A-Z]?)/g)) {
      const code = `${x[2] ?? dept}${x[3]}`;
      if (!x[2] || x[1] === "/") codes.push(code);
      if (x[1] === "/") slashPairs.push([prev, code]);
      prev = code;
    }
  }
  return { codes, slashPairs };
}

const classes: Record<string, { id: string; why: string }[]> = { A: [], B: [], C: [], D: [], E: [], F: [], H: [] };
for (const c of withPrereq) {
  const text = c.texts.prerequisite!;
  const tree = parsePrerequisite(text);
  if (!tree) continue;
  const leafList = leaves(tree);
  const inTree = new Set(leafList.map((l) => l.course));
  const flag = (k: string, why: string) => classes[k]!.push({ id: c.id, why });
  const clauses = text.split(/;|\.\s+(?=[A-Z])/);
  const codesOutside = (clause: string) => codesIn(text.replace(clause, " "));

  for (const clause of clauses) {
    if (WAIVER.test(clause) && !/\bor comparable\b/i.test(clause)) {
      const waiver = clause.slice(clause.search(/students? who|comparable/i));
      const bad = [...codesIn(waiver)].filter((k) => inTree.has(k) && !codesOutside(waiver).has(k));
      if (bad.length) flag("A", `waiver clause codes required: ${bad.join(", ")}`);
    }
    for (const ex of clause.match(EXCLUSION) ?? []) {
      const bad = [...codesIn(ex)].filter((k) => inTree.has(k) && !codesOutside(ex).has(k));
      if (bad.length) flag("B", `excluded codes required: ${bad.join(", ")}`);
    }
    if (GRADE.test(clause)) {
      const visible = clause.replace(EXCLUSION, " ");
      const bad = [...codesIn(visible)].filter((k) => inTree.has(k) && leafList.every((l) => l.course !== k || !l.minGrade));
      if (bad.length) flag("E", `no grade on ${bad.join(", ")} in "${clause.trim().slice(0, 70)}"`);
    }
  }

  const { codes, slashPairs } = shorthandCodes(text.replace(EXCLUSION, " ").replace(/students? who[^;]*$/i, " "));
  const missing = codes.filter((k) => !inTree.has(k));
  if (missing.length) flag("C", `shorthand not read: ${missing.join(", ")}`);
  const ors = nodesOfKind(tree, "any").map((n) => [...treeCourses(n)]);
  const notOr = slashPairs.filter(([a, b]) => inTree.has(a) && inTree.has(b) && !ors.some((o) => o.includes(a) && o.includes(b)));
  if (notOr.length) flag("C", `slash not an "or": ${notOr.map((p) => p.join("/")).join(", ")}`);

  for (const n of nodesOfKind(tree, "all")) {
    if (n.kind !== "all") continue;
    const direct = new Set(n.of.filter((x) => x.kind === "course").map((x) => (x as { course: string }).course));
    const dup = n.of.filter((x) => x.kind === "any").flatMap((x) => [...treeCourses(x)].filter((k) => direct.has(k)));
    if (dup.length) flag("D", `required and optional at once: ${[...new Set(dup)].join(", ")}`);
  }

  const plain = text.replace(EXCLUSION, " ");
  if (/\bor (?:other \w+ )?(?:equivalent|comparable)\b/i.test(plain) && !/equivalent|comparable/i.test(manualTexts(tree).join(" "))) {
    flag("F", "or equivalent/comparable dropped");
  }
  const one = /one of the following(?!\s*:?\s*\()/i.exec(text);
  if (one) {
    const after = [...codesIn(text.slice(one.index))];
    if (after.length > 1 && !nodesOfKind(tree, "any").some((n) => after.filter((k) => treeCourses(n).has(k)).length > 1)) {
      flag("H", "one-of list not an any");
    }
  }
}

const counts = Object.entries(classes).map(([k, v]) => `${k}=${new Set(v.map((x) => x.id)).size}`);
console.log(`\nInvented-requirement classes (courses affected): ${counts.join("  ")}`);
for (const [k, list] of Object.entries(classes)) {
  for (const e of list.slice(0, Number(process.env.SHOW_CLASS ?? 3))) console.log(`  ${k} ${e.id}: ${e.why}`);
}

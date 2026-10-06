// Pure helpers for the prerequisite audit report (scripts/prereq-audit.ts, prereq-coverage.ts).
import type { Requirement } from "./prereqs.ts";

const CODE = /\b[A-Z]{4}\s?\d{3}[A-Z]?\b/g;
export const EXCLUSION = /\((?:not|excluding|except)\b[^)]*\)/gi;
const WAIVER = /\bstudents? who (?:have taken|do not meet)\b[\s\S]*\bmay (?:contact|request)\b|\bcomparable (?:content|experience)\b/i;
const GRADE =
  /\b[A-D][+-]? or (?:higher|better)\b|\b[Mm]inimum (?:grade )?(?:of )?(?:an? )?[A-D][+-]?(?![A-Za-z0-9])|\b[Gg]rades? of [A-D]|with (?:an? )?[A-D][+-]? or/;

export const codesIn = (s: string) => new Set((s.match(CODE) ?? []).map((c) => c.replace(/\s/, "")));

export function treeCourses(r: Requirement, out = new Set<string>()): Set<string> {
  if (r.kind === "course") out.add(r.course);
  else if (r.kind === "dept-level") out.add(`${r.dept}${r.minNumber}+`);
  else if (r.kind === "all" || r.kind === "any") r.of.forEach((x) => treeCourses(x, out));
  return out;
}
export function manualTexts(r: Requirement, out: string[] = []): string[] {
  if (r.kind === "manual") out.push(r.text);
  else if (r.kind === "all" || r.kind === "any") r.of.forEach((x) => manualTexts(x, out));
  return out;
}
type CourseLeaf = Extract<Requirement, { kind: "course" }>;
function leaves(r: Requirement, out: CourseLeaf[] = []) {
  if (r.kind === "course") out.push(r);
  else if (r.kind === "all" || r.kind === "any") r.of.forEach((x) => leaves(x, out));
  return out;
}
function nodesOfKind(r: Requirement, kind: "all" | "any", out: Requirement[] = []) {
  if (r.kind === kind) out.push(r);
  if (r.kind === "all" || r.kind === "any") r.of.forEach((x) => nodesOfKind(x, kind, out));
  return out;
}

/** Codes in the text that appear neither in the tree nor in a manual item, plus codes swallowed into manual items. */
export function lostCodes(text: string, tree: Requirement): string[] {
  const inTree = treeCourses(tree);
  const manual = manualTexts(tree).join(" ");
  const lost = [...codesIn(text)].filter((code) => !inTree.has(code) && !codesIn(manual).has(code));
  const swallowed = [...codesIn(manual.replace(EXCLUSION, " "))].filter((code) => !/eligibility|placement/i.test(manual) && !inTree.has(code));
  return [...lost, ...swallowed.map((s) => `${s} (in manual)`)];
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

export type Flag = { cls: string; why: string };

/**
 * Invented-requirement classes (a tree that shows a known parsing mistake).
 *   A waiver clause codes required   B excluded course required   C slash/bare-number shorthand
 *   D both required and optional     E grade phrase but no grade   F "or equivalent" dropped
 *   H "one of the following" not an any
 */
export function detectClasses(text: string, tree: Requirement): Flag[] {
  const flags: Flag[] = [];
  const flag = (cls: string, why: string) => flags.push({ cls, why });
  const leafList = leaves(tree);
  const inTree = new Set(leafList.map((l) => l.course));
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
  return flags;
}

/** True when a ";"-separated clause mixes top-level "and" with "or" and no parentheses say which binds first. */
export function ambiguousPrecedence(text: string): boolean {
  return text.split(";").some((clause) => {
    let depth = 0;
    let and = false;
    let or = false;
    for (const tok of clause.split(/(\(|\)|\band\b|\bor\b)/i)) {
      if (tok === "(") depth++;
      else if (tok === ")") depth = Math.max(0, depth - 1);
      else if (depth === 0 && /^and$/i.test(tok)) and = true;
      else if (depth === 0 && /^or$/i.test(tok)) or = true;
    }
    return and && or;
  });
}

/** Replaces codes, grades and credit counts so texts with the same sentence shape group together. */
export function normalizeTemplate(text: string): string {
  return text
    .replace(/\b[A-Z]{4}\s?\d{3}[A-Z]?\b(?:\s*(?:,|\/|and|or)\s*\d{3}[A-Z]?\b)*/g, (m) => m.replace(/\b[A-Z]{4}\s?\d{3}[A-Z]?\b|\b\d{3}[A-Z]?\b/g, "X"))
    .replace(/\b\d+(?:\.\d+)?(?=\s+credits?\b)/gi, "N")
    // a letter grade after a grade phrase ("minimum grade of C-", "with a B") or before "or higher/better"
    .replace(/((?:[Mm]inimum (?:[Gg]rade )?(?:of )?|[Gg]rades? of |with |earn(?:ed)? |receive )(?:an? )?)([A-D][+-]?)(?![A-Za-z0-9])/g, "$1G")
    .replace(/(?<![\w+-])[A-D][+-]?(?= or (?:higher|better)\b)/g, "G")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\bg\b/g, "g");
}

export function describeRequirement(r: Requirement): string {
  switch (r.kind) {
    case "course":
      return `${r.course}${r.minGrade ? ` (min ${r.minGrade})` : ""}${r.concurrentOk ? " (concurrent ok)" : ""}`;
    case "dept-level":
      return `any ${r.dept} ${r.minNumber}+${r.minGrade ? ` (min ${r.minGrade})` : ""}`;
    case "manual":
      return `manual: "${r.text}"`;
    case "all":
    case "any":
      return `${r.kind === "all" ? "ALL" : "ANY"} of [${r.of.map(describeRequirement).join("; ")}]`;
  }
}

export function creditAnomalies(c: { min: number; max: number }): string[] {
  if (c.min > c.max) return ["min>max"];
  if (c.max === 0) return ["zero"];
  if (c.min !== c.max) return ["variable"];
  return [];
}

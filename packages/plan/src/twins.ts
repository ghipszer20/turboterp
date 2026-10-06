// Twins: courses UMD treats as the same course (program-sources/course-equivalence.md).
//   Renumbered Twin   -- Testudo "Formerly" line
//   Cross-listed Twin -- "Cross-listed with" / "Also offered as"
//   Credit-only Twin  -- "Credit only granted for"
// "Jointly offered with" is not a Twin. Nothing reads these yet; a later task will.

import type { Course } from "@turboterp/course-data";
import type { PlanCatalog } from "./catalog.ts";

export type Twins = { renumbered?: string[]; crossListed?: string[]; creditOnly?: string[] };
export type TwinKind = keyof Twins;
export const TWIN_KINDS: TwinKind[] = ["renumbered", "crossListed", "creditOnly"];

const COURSE_CODE = /^[A-Z]{4}\d{3}[A-Z]?$/;

/**
 * Course codes in one Testudo equivalence line ("CMSC320, DATA320 or STAT426."), without the
 * course's own id. Tokens that are not course codes (a typo like "ANSC4890") are returned in
 * `rejected`, never in `codes`.
 */
export function parseTwinLine(text: string | null | undefined, ownId: string): { codes: string[]; rejected: string[] } {
  const codes: string[] = [];
  const rejected: string[] = [];
  if (!text) return { codes, rejected };
  for (const raw of text.split(/[,;]|\bor\b|\band\b/i)) {
    const token = raw.replace(/\s+/g, "").replace(/\.+$/, "").toUpperCase();
    if (!token || token === ownId) continue;
    if (COURSE_CODE.test(token)) {
      if (!codes.includes(token)) codes.push(token);
    } else rejected.push(token);
  }
  return { codes, rejected };
}

/** Every Twin line of a course, as parsed lists plus the tokens that were not course codes. */
export function parseCourseTwins(course: Course): { twins: Twins; rejected: string[] } {
  const other = course.texts.other;
  const lines: [TwinKind, string | null | undefined][] = [
    ["renumbered", other["Formerly"]],
    ["crossListed", [other["Cross-listed with"], other["Also offered as"]].filter(Boolean).join(", ")],
    ["creditOnly", course.texts.creditOnlyGrantedFor],
  ];
  const twins: Twins = {};
  const rejected: string[] = [];
  for (const [kind, text] of lines) {
    const r = parseTwinLine(text, course.id);
    if (r.codes.length > 0) twins[kind] = r.codes;
    rejected.push(...r.rejected);
  }
  return { twins, rejected };
}

/**
 * The Twins of a course, each kind as a symmetric set: two courses are Twins if either one's
 * line names the other (STAT426 lists only CMSC320, but CMSC320 lists DATA320 and STAT426).
 */
export function twinsOf(catalog: PlanCatalog, id: string): Record<TwinKind, Set<string>> {
  const out: Record<TwinKind, Set<string>> = { renumbered: new Set(), crossListed: new Set(), creditOnly: new Set() };
  for (const kind of TWIN_KINDS) for (const t of catalog.get(id)?.twins?.[kind] ?? []) out[kind].add(t);
  for (const other of catalog.values()) {
    if (other.id === id || !other.twins) continue;
    for (const kind of TWIN_KINDS) if (other.twins[kind]?.includes(id)) out[kind].add(other.id);
  }
  return out;
}

/**
 * `twinsOf` for many lookups: one pass over the catalog builds the symmetric view of every
 * course, so a caller that asks about each course in a plan doesn't rescan the catalog each time.
 */
export function twinIndex(catalog: PlanCatalog): (id: string) => Record<TwinKind, Set<string>> {
  const index = new Map<string, Record<TwinKind, Set<string>>>();
  const entry = (id: string) => {
    let e = index.get(id);
    if (!e) index.set(id, (e = { renumbered: new Set(), crossListed: new Set(), creditOnly: new Set() }));
    return e;
  };
  for (const course of catalog.values()) {
    if (!course.twins) continue;
    for (const kind of TWIN_KINDS) {
      for (const t of course.twins[kind] ?? []) {
        if (t === course.id) continue;
        entry(course.id)[kind].add(t);
        entry(t)[kind].add(course.id);
      }
    }
  }
  const none = { renumbered: new Set<string>(), crossListed: new Set<string>(), creditOnly: new Set<string>() };
  return (id) => index.get(id) ?? none;
}

/** Every Twin id of a course, any kind. */
export function allTwins(t: Record<TwinKind, Set<string>>): string[] {
  return TWIN_KINDS.flatMap((k) => [...t[k]]);
}

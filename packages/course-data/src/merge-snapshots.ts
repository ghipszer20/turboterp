import type { Course } from "./soc.ts";

/**
 * One course list from several Schedule of Classes snapshots. A course seen in any term is
 * included; when it appears in several, the newest term's record (title, credits, prerequisites,
 * description) wins. Term codes are YYYYMM strings, so they sort as text.
 */
export function mergeSnapshots(snapshots: { term: string; courses: Course[] }[]): Course[] {
  const newestFirst = [...snapshots].sort((a, b) => b.term.localeCompare(a.term));
  const merged = new Map<string, Course>();
  for (const { courses } of newestFirst) for (const c of courses) if (!merged.has(c.id)) merged.set(c.id, c);
  return [...merged.values()];
}

// Course search for the picker: by code ("cmsc 35") or title words ("business writ").

import type { IndexedCourse } from "@turboterp/course-data/schedule-files";

const words = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

/**
 * Ranked: code prefix, then titles starting with the query, then titles where every query
 * word starts some title word. Ties keep code order.
 */
export function searchCourses(courses: readonly IndexedCourse[], query: string, limit = 8): IndexedCourse[] {
  const code = query.replace(/\s+/g, "").toUpperCase();
  const q = words(query);
  if (!code) return [];
  const phrase = q.join(" ");
  const ranked: { c: IndexedCourse; rank: number }[] = [];
  for (const c of courses) {
    let rank = -1;
    if (c.id.startsWith(code)) rank = 0;
    else {
      const t = words(c.title);
      if (t.join(" ").startsWith(phrase)) rank = 1;
      else if (q.every((w) => t.some((tw) => tw.startsWith(w)))) rank = 2;
    }
    if (rank >= 0) ranked.push({ c, rank });
  }
  return ranked
    .sort((a, b) => a.rank - b.rank || a.c.id.localeCompare(b.c.id))
    .slice(0, limit)
    .map((x) => x.c);
}

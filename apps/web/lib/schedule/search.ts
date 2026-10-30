// Course search for the picker: by code ("cmsc 35") or title words ("business writ").

import type { IndexedCourse } from "@turboterp/course-data/schedule-files";
import type { Season } from "@turboterp/plan/check";

const words = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

/**
 * Ranked: code prefix, then titles starting with the query, then titles where every query
 * word starts some title word. Ties keep code order.
 */
export function searchCourses<C extends { id: string; title: string }>(courses: readonly C[], query: string, limit = 8): C[] {
  const code = query.replace(/\s+/g, "").toUpperCase();
  const q = words(query);
  if (!code) return [];
  const phrase = q.join(" ");
  const ranked: { c: C; rank: number }[] = [];
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

/** A catalog course (from the Advisor's catalog file), whether or not it has sections this term. */
export type CatalogEntry = { id: string; title: string; offered?: readonly Season[] };

export type SearchResult =
  | { offered: true; course: IndexedCourse }
  | { offered: false; id: string; title: string; usually: string | null };

/** "usually fall", "usually fall and spring"; null when the catalog doesn't say. */
export function usuallyOffered(offered: readonly Season[] | undefined): string | null {
  if (!offered?.length) return null;
  const names = offered.map((s) => s.toLowerCase());
  const last = names.pop()!;
  return `usually ${names.length ? `${names.join(", ")} and ${last}` : last}`;
}

/**
 * This term's courses first, then catalog courses with no sections this term (shown as not
 * offered, not addable). Without a catalog it is a plain term search.
 */
export function searchWithCatalog(
  courses: readonly IndexedCourse[],
  catalog: readonly CatalogEntry[] | null,
  query: string,
  limit = 8,
): SearchResult[] {
  const out: SearchResult[] = searchCourses(courses, query, limit).map((course) => ({ offered: true, course }));
  if (!catalog || out.length >= limit) return out;
  const inTerm = new Set(courses.map((c) => c.id));
  const missing = catalog.filter((c) => !inTerm.has(c.id));
  for (const c of searchCourses(missing, query, limit - out.length)) {
    out.push({ offered: false, id: c.id, title: c.title, usually: usuallyOffered(c.offered) });
  }
  return out;
}

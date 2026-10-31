// Course search over the plan catalog, in memory (a few thousand courses; well under a
// millisecond per keystroke).

export type Searchable = { id: string; title: string };

const words = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

/** Exact id, then id prefix, then title words (every query word starts a title word), then title text. */
export function searchCourses<T extends Searchable>(courses: T[], query: string, limit = 20): T[] {
  const q = query.trim();
  if (!q) return [];
  const id = q.replace(/\s+/g, "").toUpperCase();
  const qWords = words(q);
  const lower = q.toLowerCase();
  const scored: { c: T; score: number }[] = [];
  for (const c of courses) {
    let score = -1;
    if (c.id === id) score = 0;
    else if (c.id.startsWith(id)) score = 1;
    else {
      const title = words(c.title);
      if (qWords.length > 0 && qWords.every((w) => title.some((t) => t.startsWith(w)))) score = 2;
      else if (c.title.toLowerCase().includes(lower)) score = 3;
    }
    if (score >= 0) scored.push({ c, score });
  }
  return scored
    .sort((a, b) => a.score - b.score || a.c.id.localeCompare(b.c.id))
    .slice(0, limit)
    .map((x) => x.c);
}

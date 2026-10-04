// PlanetTerp professor ratings for the instructors in a Schedule of Classes snapshot.
// The build script pages through GET /professors (100 per page) and keeps only the
// instructors teaching this term, keyed by the Schedule of Classes spelling, so the
// schedule builder can look up `ratings[section.instructors[i]]` directly.

import { SourceError } from "@turboterp/campus-data/http";
import { isTba, nameTokens } from "./course-grades.ts";

export type ProfessorRating = { name: string; averageRating: number | null };

/** One page of GET /professors?limit=100&offset=N. */
export function parseProfessorList(data: unknown): ProfessorRating[] {
  if (!Array.isArray(data)) throw new SourceError("planetterp", "response shape changed: professors is not a list");
  return data.map((p) => {
    const o = p as { name?: unknown; average_rating?: unknown };
    if (typeof o.name !== "string") throw new SourceError("planetterp", "response shape changed: professor.name");
    return { name: o.name, averageRating: typeof o.average_rating === "number" ? o.average_rating : null };
  });
}

/**
 * Ratings keyed by Schedule of Classes spelling. An exact name (ignoring case, accents and
 * punctuation) wins; otherwise a unique first-and-last-name match. Ambiguous, unrated,
 * TBA and unknown instructors are left out (the UI shows them as unrated).
 */
export function ratingsForInstructors(professors: ProfessorRating[], socInstructors: string[]): Record<string, number> {
  const exact = new Map<string, ProfessorRating[]>();
  const firstLast = new Map<string, ProfessorRating[]>();
  const push = (map: Map<string, ProfessorRating[]>, key: string, p: ProfessorRating) =>
    map.set(key, [...(map.get(key) ?? []), p]);
  for (const p of professors) {
    const t = nameTokens(p.name);
    if (t.length === 0) continue;
    push(exact, t.join(" "), p);
    push(firstLast, `${t[0]} ${t.at(-1)}`, p);
  }

  const out: Record<string, number> = {};
  for (const name of new Set(socInstructors)) {
    if (isTba(name)) continue;
    const t = nameTokens(name);
    if (t.length === 0) continue;
    const hits = exact.get(t.join(" ")) ?? firstLast.get(`${t[0]} ${t.at(-1)}`) ?? [];
    const rated = [...new Set(hits.map((h) => h.averageRating))];
    if (rated.length !== 1 || rated[0] === null) continue;
    out[name] = Math.round(rated[0]! * 100) / 100;
  }
  return out;
}

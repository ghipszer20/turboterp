// A short summary of one PlanetTerp professor's reviews, for the schedule builder's
// instructor panel. Review text is only whitespace-collapsed and trimmed, never rewritten.

import { SourceError } from "@turboterp/campus-data/http";
import { isTba, nameTokens } from "./course-grades.ts";

export type ReviewExcerpt = { course: string | null; rating: number; year: number; text: string };
export type ReviewSummary = {
  name: string;
  slug: string;
  averageRating: number | null;
  count: number;
  /** Review counts for 5, 4, 3, 2, 1 stars, in that order. */
  breakdown: [number, number, number, number, number];
  courses: string[];
  excerpts: ReviewExcerpt[];
};

const EXCERPTS = 3;
const MAX_TEXT = 240;

function excerptText(raw: string): string {
  const text = raw.replace(/\s+/g, " ").trim();
  if (text.length <= MAX_TEXT) return text;
  const cut = text.slice(0, MAX_TEXT + 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > 0 ? cut.slice(0, space) : text.slice(0, MAX_TEXT)).trimEnd()}…`;
}

type RawReview = { course?: unknown; review?: unknown; rating?: unknown; created?: unknown };

/** One professor entry from GET /professors?reviews=true. */
export function summarizeProfessor(entry: unknown): ReviewSummary {
  const p = entry as { name?: unknown; slug?: unknown; average_rating?: unknown; reviews?: unknown };
  if (typeof p?.name !== "string" || typeof p.slug !== "string") {
    throw new SourceError("planetterp", "response shape changed: professor.name/slug");
  }
  const reviews = (Array.isArray(p.reviews) ? p.reviews : []) as RawReview[];
  const breakdown: ReviewSummary["breakdown"] = [0, 0, 0, 0, 0];
  const courses = new Set<string>();
  const dated: { time: number; r: ReviewExcerpt }[] = [];
  for (const r of reviews) {
    const rating = typeof r.rating === "number" ? Math.round(r.rating) : 0;
    if (rating >= 1 && rating <= 5) breakdown[5 - rating]!++;
    const course = typeof r.course === "string" && r.course ? r.course : null;
    if (course) courses.add(course);
    const time = typeof r.created === "string" ? Date.parse(r.created) : NaN;
    dated.push({
      time: Number.isNaN(time) ? 0 : time,
      r: {
        course,
        rating,
        year: Number.isNaN(time) ? 0 : new Date(time).getUTCFullYear(),
        text: excerptText(typeof r.review === "string" ? r.review : ""),
      },
    });
  }
  dated.sort((a, b) => b.time - a.time);
  return {
    name: p.name,
    slug: p.slug,
    averageRating: typeof p.average_rating === "number" ? Math.round(p.average_rating * 100) / 100 : null,
    count: reviews.length,
    breakdown,
    courses: [...courses].sort(),
    excerpts: dated.slice(0, EXCERPTS).map((d) => d.r).filter((e) => e.text),
  };
}

/** File-name-safe key for a Schedule of Classes instructor name (used by the build and the web app). */
export function instructorFileKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

/**
 * Summaries keyed by Schedule of Classes spelling, matched like ratingsForInstructors:
 * exact name, else unique first+last. Ambiguous, TBA and unknown names get nothing.
 */
export function reviewSummariesForInstructors(entries: unknown[], socInstructors: string[]): Record<string, ReviewSummary> {
  const summaries = entries.map(summarizeProfessor);
  const exact = new Map<string, ReviewSummary[]>();
  const firstLast = new Map<string, ReviewSummary[]>();
  const push = (m: Map<string, ReviewSummary[]>, k: string, s: ReviewSummary) => m.set(k, [...(m.get(k) ?? []), s]);
  for (const s of summaries) {
    const t = nameTokens(s.name);
    if (t.length === 0) continue;
    push(exact, t.join(" "), s);
    push(firstLast, `${t[0]} ${t.at(-1)}`, s);
  }
  const out: Record<string, ReviewSummary> = {};
  for (const name of new Set(socInstructors)) {
    if (isTba(name)) continue;
    const t = nameTokens(name);
    if (t.length === 0) continue;
    const hits = exact.get(t.join(" ")) ?? firstLast.get(`${t[0]} ${t.at(-1)}`) ?? [];
    const slugs = new Set(hits.map((h) => h.slug));
    if (slugs.size !== 1) continue;
    out[name] = hits[0]!;
  }
  return out;
}

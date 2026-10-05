// An instructor's PlanetTerp review summary for the schedule builder's instructor panel:
// where the file lives, loading it on demand, and what the panel shows.

import { instructorFileKey, type ReviewSummary } from "@turboterp/ratings";

export type ReviewsState = { status: "ready"; summary: ReviewSummary } | { status: "error" };

export const reviewsFileUrl = (term: string, name: string) => `/api/schedule/${term}/reviews/${instructorFileKey(name)}`;

const isSummary = (x: unknown): x is ReviewSummary => {
  const s = x as Partial<ReviewSummary> | null;
  return (
    typeof s === "object" &&
    s !== null &&
    typeof s.name === "string" &&
    typeof s.slug === "string" &&
    typeof s.count === "number" &&
    Array.isArray(s.breakdown) &&
    s.breakdown.length === 5 &&
    Array.isArray(s.courses) &&
    Array.isArray(s.excerpts)
  );
};

/** Fetches one summary. Any failure (offline, missing file, bad shape) is a plain "error". */
export async function loadReviews(url: string, fetchFn: typeof fetch = fetch): Promise<ReviewsState> {
  try {
    const res = await fetchFn(url);
    if (!res.ok) return { status: "error" };
    const data: unknown = await res.json();
    return isSummary(data) ? { status: "ready", summary: data } : { status: "error" };
  } catch {
    return { status: "error" };
  }
}

export function reviewsView(s: ReviewSummary) {
  const biggest = Math.max(1, ...s.breakdown);
  return {
    empty: s.count === 0,
    countLabel: `${s.count} ${s.count === 1 ? "review" : "reviews"}`,
    rows: s.breakdown.map((n, i) => ({ stars: 5 - i, count: n, percent: Math.round((n / biggest) * 100) })),
    profileUrl: `https://planetterp.com/professor/${encodeURIComponent(s.slug)}`,
  };
}

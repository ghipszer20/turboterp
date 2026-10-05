import { describe, expect, it } from "vitest";
import type { ReviewSummary } from "@turboterp/ratings";
import { loadReviews, reviewsFileUrl, reviewsView, popoverPlacement } from "../instructor-reviews";

const summary: ReviewSummary & { v: number } = {
  v: 1,
  name: "Ting Jiang",
  slug: "jiang",
  averageRating: 3.46,
  count: 4,
  breakdown: [2, 1, 0, 1, 0],
  courses: ["CMSC250", "CMSC351"],
  excerpts: [{ course: "CMSC351", rating: 4, year: 2025, text: "Clear lectures." }],
};

describe("reviewsFileUrl", () => {
  it("points at the instructor's file for the term", () => {
    expect(reviewsFileUrl("202701", "José Núñez")).toBe("/api/schedule/202701/reviews/jose-nunez");
  });
});

describe("loadReviews", () => {
  const ok = (body: unknown) => async () => new Response(JSON.stringify(body), { status: 200 });
  it("returns the summary", async () => {
    expect(await loadReviews("/x", ok(summary))).toEqual({ status: "ready", summary });
  });
  it("fails plainly on an HTTP error, a missing file or a network error", async () => {
    expect(await loadReviews("/x", async () => new Response("no", { status: 500 }))).toEqual({ status: "error" });
    expect(await loadReviews("/x", async () => new Response("no", { status: 404 }))).toEqual({ status: "error" });
    expect(
      await loadReviews("/x", async () => {
        throw new Error("offline");
      }),
    ).toEqual({ status: "error" });
  });
  it("fails on a malformed file", async () => {
    expect(await loadReviews("/x", ok({ nope: 1 }))).toEqual({ status: "error" });
  });
});

describe("reviewsView", () => {
  it("lists stars 5 to 1 with bar widths relative to the biggest group", () => {
    const v = reviewsView(summary);
    expect(v.rows.map((r) => r.stars)).toEqual([5, 4, 3, 2, 1]);
    expect(v.rows.map((r) => r.percent)).toEqual([100, 50, 0, 50, 0]);
    expect(v.countLabel).toBe("4 reviews");
    expect(v.empty).toBe(false);
    expect(v.profileUrl).toBe("https://planetterp.com/professor/jiang");
  });
  it("says so when there are no reviews", () => {
    const v = reviewsView({ ...summary, count: 0, averageRating: null, breakdown: [0, 0, 0, 0, 0] as ReviewSummary["breakdown"], excerpts: [], courses: [] });
    expect(v.empty).toBe(true);
    expect(v.countLabel).toBe("0 reviews");
    expect(v.rows.every((r) => r.percent === 0)).toBe(true);
  });
  it("uses the singular for one review", () => {
    expect(reviewsView({ ...summary, count: 1 }).countLabel).toBe("1 review");
  });
});

describe("popoverPlacement", () => {
  const view = { width: 1280, height: 820 };

  it("opens below the name when there is room", () => {
    expect(popoverPlacement({ top: 100, bottom: 120, left: 300 }, view)).toEqual({ top: 128, left: 300, maxHeight: 680 });
  });

  it("opens above a name near the bottom of the screen", () => {
    expect(popoverPlacement({ top: 770, bottom: 790, left: 300 }, view)).toEqual({ bottom: 58, left: 300, maxHeight: 750 });
  });

  it("keeps the panel inside the right edge", () => {
    expect(popoverPlacement({ top: 100, bottom: 120, left: 1200 }, view).left).toBe(1280 - 340 - 12);
  });
});

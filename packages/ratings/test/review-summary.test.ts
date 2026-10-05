import { describe, expect, it } from "vitest";
import { instructorFileKey, reviewSummariesForInstructors, summarizeProfessor } from "../src/review-summary.ts";

const rev = (rating: number, created: string, extra: Record<string, unknown> = {}) => ({
  professor: "Ting Jiang",
  course: "CMSC351",
  review: "Good.",
  rating,
  expected_grade: "A",
  created,
  ...extra,
});
const prof = (reviews: unknown[], extra: Record<string, unknown> = {}) => ({
  name: "Ting Jiang",
  slug: "jiang",
  type: "professor",
  average_rating: 3.456,
  courses: ["CMSC351"],
  reviews,
  ...extra,
});

describe("summarizeProfessor", () => {
  it("counts, breaks down by stars and lists distinct courses", () => {
    const s = summarizeProfessor(
      prof([
        rev(5, "2025-01-01T00:00:00"),
        rev(5, "2024-01-01T00:00:00", { course: "CMSC250" }),
        rev(2, "2023-01-01T00:00:00", { course: null }),
      ]),
    );
    expect(s.count).toBe(3);
    expect(s.breakdown).toEqual([2, 0, 0, 1, 0]);
    expect(s.courses).toEqual(["CMSC250", "CMSC351"]);
    expect(s.averageRating).toBe(3.46);
    expect(s.slug).toBe("jiang");
  });

  it("keeps the 3 most recent reviews as excerpts, with course, stars and year", () => {
    const s = summarizeProfessor(
      prof([
        rev(1, "2020-05-01T00:00:00", { review: "old" }),
        rev(4, "2025-05-01T00:00:00", { review: "newest" }),
        rev(3, "2023-05-01T00:00:00", { review: "mid", course: null }),
        rev(2, "2024-05-01T00:00:00", { review: "newer" }),
      ]),
    );
    expect(s.excerpts).toEqual([
      { course: "CMSC351", rating: 4, year: 2025, text: "newest" },
      { course: "CMSC351", rating: 2, year: 2024, text: "newer" },
      { course: null, rating: 3, year: 2023, text: "mid" },
    ]);
  });

  it("collapses whitespace and cuts long text at a word boundary with an ellipsis", () => {
    const long = Array.from({ length: 80 }, (_, i) => `word${i}`).join(" ");
    const s = summarizeProfessor(prof([rev(5, "2025-01-01T00:00:00", { review: `Line one.\r\n\r\n  Line   two. ${long}` })]));
    const t = s.excerpts[0]!.text;
    expect(t.startsWith("Line one. Line two. word0")).toBe(true);
    expect(t.endsWith("…")).toBe(true);
    expect(t.length).toBeLessThanOrEqual(241);
    const body = t.slice(0, -1);
    expect(body.endsWith(" ")).toBe(false);
    expect(`Line one. Line two. ${long}`.startsWith(body)).toBe(true);
    expect(`Line one. Line two. ${long}`[body.length]).toBe(" ");
  });

  it("leaves short text word for word", () => {
    const s = summarizeProfessor(prof([rev(5, "2025-01-01T00:00:00", { review: "  Great   class!\n" })]));
    expect(s.excerpts[0]!.text).toBe("Great class!");
  });

  it("handles a professor with no reviews", () => {
    const s = summarizeProfessor(prof([], { average_rating: null }));
    expect(s).toMatchObject({ count: 0, averageRating: null, breakdown: [0, 0, 0, 0, 0], courses: [], excerpts: [] });
  });
});

describe("instructorFileKey", () => {
  it("is a safe, stable name for a Schedule of Classes spelling", () => {
    expect(instructorFileKey("José A. Núñez")).toBe("jose-a-nunez");
    expect(instructorFileKey("Ting  Jiang")).toBe(instructorFileKey("ting jiang"));
    expect(instructorFileKey("../x")).toBe("x");
  });
});

describe("reviewSummariesForInstructors", () => {
  const p = (name: string, slug: string) => prof([rev(5, "2025-01-01T00:00:00")], { name, slug });
  it("keys summaries by SOC spelling via the same name matching as ratings", () => {
    const out = reviewSummariesForInstructors([p("José Núñez", "nunez")], ["Jose Nunez", "Instructor: TBA", "Nobody Here"]);
    expect(Object.keys(out)).toEqual(["Jose Nunez"]);
    expect(out["Jose Nunez"]!.slug).toBe("nunez");
  });
  it("gives nothing for ambiguous names", () => {
    const out = reviewSummariesForInstructors([p("Ann Lee", "lee1"), p("Ann B Lee", "lee2")], ["Ann Lee"]);
    expect(out["Ann Lee"]!.slug).toBe("lee1");
    expect(reviewSummariesForInstructors([p("Ann C Lee", "a"), p("Ann D Lee", "b")], ["Ann Lee"])).toEqual({});
  });
  it("still summarizes a matched professor with zero reviews", () => {
    const out = reviewSummariesForInstructors([prof([], { name: "Zed Q", slug: "q" })], ["Zed Q"]);
    expect(out["Zed Q"]!.count).toBe(0);
  });
});

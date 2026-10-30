import { describe, expect, it } from "vitest";
import type { Section } from "@turboterp/course-data/schedules";
import { distributionFromCounts, GRADE_COLUMNS, type CourseGrades } from "@turboterp/ratings";
import { bestRating, conflictPairs, gpasFor, gradeSummary, recommendReason, instructorLabel, meetingSummary, overlapsWith, pickSection, ratingTone, sectionChoices, sectionKey } from "../sections";

const sec = (
  id: string,
  instructors: string[],
  meetings: [string[], number, number, string][],
  open = 10,
  courseId = "STAT400",
): Section => ({
  id,
  courseId,
  instructors,
  seats: { total: 30, open, waitlist: 0, holdfile: 0 },
  delivery: "f2f",
  meetings: meetings.map(([days, start, end, type]) => ({ days, start, end, building: "ARM", room: "0131", type })),
});

const MWF10 = [["M", "W", "F"], 600, 650, "Lecture"] as [string[], number, number, string];
const s0111 = sec("0111", ["Archana Khurana"], [MWF10, [["Tu"], 720, 770, "Discussion"]]);
const s0121 = sec("0121", ["Archana Khurana"], [MWF10, [["Tu"], 780, 830, "Discussion"]]);
const s0131full = sec("0131", ["Archana Khurana"], [MWF10, [["Tu"], 840, 890, "Discussion"]], 0);
const s0211 = sec("0211", ["Salman Safdar"], [[["M", "W", "F"], 660, 710, "Lecture"], [["Th"], 480, 530, "Discussion"]]);
const s0311 = sec("0311", ["Shixin Zheng"], [[["Tu", "Th"], 570, 645, "Lecture"], [["F"], 660, 710, "Discussion"]]);
const s0111other = sec("0141", ["Someone Else"], [MWF10, [["Tu"], 900, 950, "Discussion"]]);
const all = [s0311, s0211, s0131full, s0121, s0111, s0111other];

describe("sectionChoices", () => {
  it('lists "same lecture, other discussion" first, then other lecture times', () => {
    const c = sectionChoices(all, s0111);
    expect(c.sameLecture.map((s) => s.id)).toEqual(["0111", "0121"]);
    expect(c.otherLectures.map((s) => s.id)).toEqual(["0141", "0211", "0311"]);
  });

  it("never offers a full section", () => {
    const c = sectionChoices(all, s0111);
    expect([...c.sameLecture, ...c.otherLectures].map((s) => s.id)).not.toContain("0131");
  });

  it("treats a different instructor at the same time as a different lecture", () => {
    expect(sectionChoices(all, s0111).sameLecture.map((s) => s.id)).not.toContain("0141");
  });

  it("orders other lectures by their first class in the week", () => {
    expect(sectionChoices(all, s0311).otherLectures.map((s) => s.id)).toEqual(["0111", "0121", "0141", "0211"]);
  });

  it("with nothing chosen yet (Build my own), lists every open section by time", () => {
    const c = sectionChoices(all, null);
    expect(c.sameLecture).toEqual([]);
    expect(c.otherLectures.map((s) => s.id)).toEqual(["0111", "0121", "0141", "0211", "0311"]);
  });
});

describe("pickSection", () => {
  it("picks the best-rated instructor's section among interchangeable ones", () => {
    const group = [sec("0101", ["Low"], [MWF10]), sec("0102", ["High"], [MWF10])];
    expect(pickSection(group, { Low: 2.1, High: 4.4 }).id).toBe("0102");
  });

  it("counts unrated instructors as neutral (3), like Best first does", () => {
    const group = [sec("0101", ["Low"], [MWF10]), sec("0102", ["Unrated"], [MWF10])];
    expect(pickSection(group, { Low: 2.1 }).id).toBe("0102");
  });

  it("keeps the first section on a tie", () => {
    const group = [sec("0101", [], [MWF10]), sec("0102", [], [MWF10])];
    expect(pickSection(group, {}).id).toBe("0101");
  });
});

describe("sectionKey", () => {
  it("identifies a section across courses", () => {
    expect(sectionKey(s0111)).toBe("STAT400/0111");
  });
});

describe("ratingTone", () => {
  it("colors ratings: 4+ good, 3+ fair, below 3 low, none unrated", () => {
    expect([4.6, 4, 3.2, 2.9, undefined].map(ratingTone)).toEqual(["good", "good", "fair", "low", "none"]);
  });
});

describe("gradeSummary", () => {
  const counts = (n: Partial<Record<(typeof GRADE_COLUMNS)[number], number>>) =>
    Object.fromEntries(GRADE_COLUMNS.map((c) => [c, n[c] ?? 0])) as Record<(typeof GRADE_COLUMNS)[number], number>;
  const khurana = distributionFromCounts(counts({ A: 50, "B+": 20, C: 10, F: 5, W: 10, Other: 5 }), ["202401"]);
  const grades: Record<string, CourseGrades> = {
    STAT400: { course: "STAT400", overall: khurana, byProfessor: { "Archana Khurana": khurana }, terms: ["202401"] },
  };

  it("summarizes that professor in that course: A/B/C/D/F/W shares, GPA and students", () => {
    const g = gradeSummary(grades, "STAT400", ["Archana Khurana"]);
    expect(g).not.toBeNull();
    expect(g!.students).toBe(100);
    expect(g!.bars.map((b) => [b.letter, b.share])).toEqual([
      ["A", 0.5],
      ["B", 0.2],
      ["C", 0.1],
      ["D", 0],
      ["F", 0.05],
      ["W", 0.1],
    ]);
    expect(g!.gpa).toBeCloseTo(khurana.averageGpa!, 5);
  });

  it("is null (\"No grade data\") for an unknown professor, course or missing file", () => {
    expect(gradeSummary(grades, "STAT400", ["New Person"])).toBeNull();
    expect(gradeSummary(grades, "STAT401", ["Archana Khurana"])).toBeNull();
    expect(gradeSummary(null, "STAT400", ["Archana Khurana"])).toBeNull();
    expect(gradeSummary(grades, "STAT400", [])).toBeNull();
  });

  it("uses the first co-instructor with data", () => {
    expect(gradeSummary(grades, "STAT400", ["New Person", "Archana Khurana"])?.students).toBe(100);
  });
});

describe("instructorLabel", () => {
  it("names the section's instructor, TBA when none", () => {
    expect(instructorLabel(s0111)).toBe("Archana Khurana");
    expect(instructorLabel(sec("0101", [], [MWF10]))).toBe("TBA");
  });

  it("counts the other instructors among interchangeable sections", () => {
    expect(instructorLabel(s0111, [s0111, s0111other, s0211])).toBe("Archana Khurana +2");
  });
});

describe("bestRating", () => {
  it("is the best rating among the section's instructors, undefined when unrated", () => {
    const co = sec("0101", ["A", "B"], [MWF10]);
    expect(bestRating(co, { A: 3.2, B: 4.1 })).toBe(4.1);
    expect(bestRating(co, {})).toBeUndefined();
  });
});

describe("meetingSummary", () => {
  it("lists each meeting's days and times, naming non-lecture meetings", () => {
    expect(meetingSummary(s0311)).toBe("TuTh 9:30am–10:45am · F 11am–11:50am Discussion");
  });

  it("says when a meeting has no set time", () => {
    const online = sec("0101", [], [[[], 0, 0, "Lecture"]]);
    online.meetings[0]!.start = null;
    online.meetings[0]!.end = null;
    expect(meetingSummary(online)).toBe("Time TBA");
  });
});

describe("overlapsWith", () => {
  it("names the other placed courses a candidate section would overlap", () => {
    const cmsc = sec("0101", ["Ting Jiang"], [[["M", "W", "F"], 600, 650, "Lecture"]], 10, "CMSC351");
    const engl = sec("0101", [], [[["Tu"], 1000, 1050, "Lecture"]], 10, "ENGL394");
    expect(overlapsWith(s0111, [cmsc, engl])).toEqual(["CMSC351"]);
    expect(overlapsWith(s0311, [cmsc, engl])).toEqual([]);
  });

  it("ignores the candidate's own course (it would be replaced)", () => {
    expect(overlapsWith(s0121, [s0111])).toEqual([]);
  });
});

describe("conflictPairs", () => {
  it("lists each overlapping pair of placed courses once", () => {
    const cmsc = sec("0101", [], [[["M", "W", "F"], 600, 650, "Lecture"]], 10, "CMSC351");
    const engl = sec("0101", [], [[["M"], 620, 700, "Lecture"]], 10, "ENGL394");
    const math = sec("0101", [], [[["Tu"], 600, 650, "Lecture"]], 10, "MATH140");
    expect(conflictPairs([cmsc, s0111, engl, math])).toEqual([
      ["CMSC351", "STAT400"],
      ["CMSC351", "ENGL394"],
      ["STAT400", "ENGL394"],
    ]);
  });
});

describe("recommendation helpers", () => {
  const counts = Object.fromEntries(GRADE_COLUMNS.map((c) => [c, c === "A" ? 10 : c === "B" ? 10 : 0])) as Record<(typeof GRADE_COLUMNS)[number], number>;
  const d = distributionFromCounts(counts, ["202401"]);
  const grades = { STAT: { STAT400: { course: "STAT400", overall: d, byProfessor: { "Ann Lee": d }, terms: [] } } };

  it("gpasFor maps course and professor to average GPA, skipping missing departments", () => {
    const gpas = gpasFor({ ...grades, MATH: "missing" }, ["STAT400", "MATH140", "CMSC131"]);
    expect(gpas).toEqual({ "STAT400|Ann Lee": 3.5 });
  });

  it("recommendReason is plain words and leaves out missing data", () => {
    const s = sec("0101", ["Ann Lee"], [MWF10], 12);
    expect(recommendReason(s, { "Ann Lee": 4.6 }, { "STAT400|Ann Lee": 3.4 })).toBe("4.6★ · avg GPA 3.4");
    expect(recommendReason(s, {}, {})).toBe("");
  });
});

describe("sort labels (owner, 2026-10-07)", () => {
  it("are Default and Best Teachers", async () => {
    const { SORT_OPTIONS } = await import("../filters");
    const labels = Object.fromEntries(SORT_OPTIONS.map((o: { value: string; label: string }) => [o.value, o.label]));
    expect(labels.best).toBe("Default");
    expect(labels.recommended).toBe("Best Teachers");
  });
});

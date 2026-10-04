// Sorting layouts: best first (ratings, gaps, time of day) and the simple keys.
// Expected orders are worked out by hand.

import { describe, expect, it } from "vitest";
import type { Layout } from "../src/schedules.ts";
import { gpaKey, groupScore, layoutMetrics, RECOMMEND_WEIGHTS, sectionScore, sortLayouts } from "../src/sort.ts";
import type { Meeting, Section } from "../src/soc.ts";

const mins = (t: string) => Number(t.split(":")[0]) * 60 + Number(t.split(":")[1]);
const at = (days: string[], start: string, end: string): Meeting => ({
  days,
  start: mins(start),
  end: mins(end),
  building: "ESJ",
  room: "0202",
  type: "Lecture",
});
let n = 0;
const sec = (courseId: string, instructors: string[], open: number, ...meetings: Meeting[]): Section => ({
  id: String(++n).padStart(4, "0"),
  courseId,
  instructors,
  seats: { total: 30, open, waitlist: 0, holdfile: 0 },
  delivery: "f2f",
  meetings,
});
/** A layout with one choice group per course. */
const layout = (name: string, ...groups: Section[][]): Layout & { name?: string } =>
  Object.assign(groups, { name });
const names = (layouts: Layout[]) => layouts.map((l) => (l as { name?: string }).name);

const ratings = { "Ada Good": 4.5, "Bo Fine": 3.5, "Cy Meh": 2.5, "Di Bad": 2.0 };

describe("sortLayouts: best", () => {
  it("ranks by the average rating of each course's best instructor, first of all", () => {
    const great = layout("great", [sec("A", ["Ada Good"], 5, at(["M"], "08:00", "08:50"), at(["M"], "15:00", "15:50"))]);
    const ok = layout("ok", [sec("A", ["Bo Fine"], 5, at(["M"], "11:00", "11:50"))]);
    expect(names(sortLayouts([ok, great], "best", { ratings }))).toEqual(["great", "ok"]);
  });

  it("counts the best instructor among a group's interchangeable sections", () => {
    const mixed = layout("mixed", [sec("A", ["Di Bad"], 5, at(["M"], "11:00", "11:50")), sec("A", ["Ada Good"], 5, at(["M"], "11:00", "11:50"))]);
    const fine = layout("fine", [sec("A", ["Bo Fine"], 5, at(["M"], "11:00", "11:50"))]);
    expect(layoutMetrics(mixed, { ratings }).rating).toBe(4.5);
    expect(names(sortLayouts([fine, mixed], "best", { ratings }))).toEqual(["mixed", "fine"]);
  });

  it("treats unrated instructors, TBA and no instructor as neutral (3)", () => {
    const unrated = layout("unrated", [sec("A", ["New Person"], 5, at(["M"], "11:00", "11:50"))]);
    const tba = layout("tba", [sec("A", ["TBA"], 5, at(["M"], "11:00", "11:50"))]);
    const none = layout("none", [sec("A", [], 5, at(["M"], "11:00", "11:50"))]);
    expect(layoutMetrics(unrated, { ratings }).rating).toBe(3);
    expect(layoutMetrics(tba, { ratings }).rating).toBe(3);
    expect(layoutMetrics(none, {}).rating).toBe(3);
    const meh = layout("meh", [sec("A", ["Cy Meh"], 5, at(["M"], "11:00", "11:50"))]);
    const fine = layout("fine", [sec("A", ["Bo Fine"], 5, at(["M"], "11:00", "11:50"))]);
    expect(names(sortLayouts([meh, unrated, fine], "best", { ratings }))).toEqual(["fine", "unrated", "meh"]);
  });

  it("averages over courses", () => {
    const l = layout(
      "l",
      [sec("A", ["Ada Good"], 5, at(["M"], "11:00", "11:50"))],
      [sec("B", ["Cy Meh"], 5, at(["Tu"], "11:00", "11:50"))],
    );
    expect(layoutMetrics(l, { ratings }).rating).toBe(3.5);
  });

  it("breaks rating ties by fewer gap minutes between classes on the same day", () => {
    const gappy = layout(
      "gappy",
      [sec("A", [], 5, at(["M"], "11:00", "11:50"))],
      [sec("B", [], 5, at(["M"], "13:00", "13:50"))], // 70-minute gap
    );
    const tight = layout(
      "tight",
      [sec("A", [], 5, at(["M"], "08:00", "08:50"))],
      [sec("B", [], 5, at(["M"], "09:00", "09:50"))], // 10-minute gap, but early
    );
    expect(layoutMetrics(gappy, {}).gapMinutes).toBe(70);
    expect(layoutMetrics(tight, {}).gapMinutes).toBe(10);
    expect(names(sortLayouts([gappy, tight]))).toEqual(["tight", "gappy"]);
  });

  it("breaks rating and gap ties by preferring classes toward midday, with no cutoff hours", () => {
    const early = layout("early", [sec("A", [], 5, at(["M"], "08:00", "08:50"))]);
    const midday = layout("midday", [sec("A", [], 5, at(["M"], "11:00", "11:50"))]);
    const evening = layout("evening", [sec("A", [], 5, at(["M"], "18:00", "18:50"))]);
    const afternoon = layout("afternoon", [sec("A", [], 5, at(["M"], "14:00", "14:50"))]);
    const lateAfternoon = layout("lateAfternoon", [sec("A", [], 5, at(["M"], "15:00", "15:50"))]);
    // Span 50 + 0.25 × 35 minutes between the class's midpoint (11:25) and 12:00.
    expect(layoutMetrics(midday, {}).condensed).toBe(58.75);
    expect(names(sortLayouts([evening, early, lateAfternoon, afternoon, midday]))).toEqual([
      "midday",
      "afternoon",
      "lateAfternoon",
      "early",
      "evening",
    ]);
  });

  it("breaks rating and gap ties by shorter days before closeness to midday", () => {
    const long = layout("long", [sec("A", [], 5, at(["M"], "11:00", "12:15"))]); // 75-minute day at midday
    const short = layout("short", [sec("A", [], 5, at(["M"], "10:00", "10:50"))]); // 50-minute day, a bit early
    expect(names(sortLayouts([long, short]))).toEqual(["short", "long"]);
  });

  it("ignores open seats", () => {
    const few = layout("few", [sec("A", [], 1, at(["M"], "11:00", "11:50"))]);
    const many = layout("many", [sec("A", [], 99, at(["M"], "11:00", "11:50"))]);
    expect(names(sortLayouts([few, many]))).toEqual(["few", "many"]);
    expect(names(sortLayouts([many, few]))).toEqual(["many", "few"]);
  });

  it("is the default and leaves the input array alone", () => {
    const early = layout("early", [sec("A", [], 5, at(["M"], "08:00", "08:50"))]);
    const midday = layout("midday", [sec("A", [], 5, at(["M"], "11:00", "11:50"))]);
    const input = [early, midday];
    expect(names(sortLayouts(input))).toEqual(["midday", "early"]);
    expect(names(input)).toEqual(["early", "midday"]);
  });
});

describe("sortLayouts: simple keys", () => {
  const mwf = layout("mwf", [sec("A", [], 5, at(["M", "W", "F"], "09:00", "09:50"))]);
  const tuth = layout("tuth", [sec("A", [], 5, at(["Tu", "Th"], "12:30", "13:45"))]);
  const late = layout("late", [sec("A", [], 5, at(["M", "W"], "15:00", "16:15"))]);

  it("fewestDays", () => {
    expect(layoutMetrics(mwf, {}).days).toBe(3);
    expect(names(sortLayouts([mwf, late, tuth], "fewestDays"))[2]).toBe("mwf");
  });

  it("latestStart puts the latest first class of the week first", () => {
    expect(names(sortLayouts([mwf, late, tuth], "latestStart"))).toEqual(["late", "tuth", "mwf"]);
  });

  it("earliestFinish puts the earliest last class of the week first", () => {
    expect(names(sortLayouts([late, tuth, mwf], "earliestFinish"))).toEqual(["mwf", "tuth", "late"]);
  });

  it("fewestGaps", () => {
    const gappy = layout(
      "gappy",
      [sec("A", [], 5, at(["M"], "11:00", "11:50"))],
      [sec("B", [], 5, at(["M"], "13:00", "13:50"))],
    );
    const apartDays = layout(
      "apartDays",
      [sec("A", [], 5, at(["M"], "11:00", "11:50"))],
      [sec("B", [], 5, at(["Tu"], "13:00", "13:50"))],
    );
    expect(names(sortLayouts([gappy, apartDays], "fewestGaps"))).toEqual(["apartDays", "gappy"]);
  });

  it("breaks ties with best", () => {
    const rated = layout("rated", [sec("A", ["Ada Good"], 5, at(["M"], "08:00", "08:50"))]);
    const plain = layout("plain", [sec("A", [], 5, at(["W"], "08:00", "08:50"))]);
    expect(names(sortLayouts([plain, rated], "fewestDays", { ratings }))).toEqual(["rated", "plain"]);
  });
});

describe("sortLayouts: recommended", () => {
  const t = at(["M"], "11:00", "11:50");
  const gpas = { [gpaKey("A", "Ada Good")]: 3.8, [gpaKey("A", "Di Bad")]: 2.0 };

  it("weights sum to 1, rating and GPA count double the seats", () => {
    const { rating, gpa, seats } = RECOMMEND_WEIGHTS;
    expect(rating + gpa + seats).toBeCloseTo(1);
    expect(rating).toBeGreaterThan(seats);
    expect(gpa).toBeGreaterThan(seats);
  });

  it("counts missing rating and GPA as neutral (0.5)", () => {
    const s = sec("A", ["Nobody"], 0, t);
    expect(sectionScore(s, { ratings, gpas })).toBeCloseTo(0.4 * 0.5 + 0.4 * 0.5);
  });

  it("scores missing grade data like a typical 3.0 GPA, not a 2.0", () => {
    const typical = { [gpaKey("A", "Mid")]: 3.0 };
    expect(sectionScore(sec("A", ["Nobody"], 0, t))).toBeCloseTo(sectionScore(sec("A", ["Mid"], 0, t), { gpas: typical }));
  });

  it("saturates open seats at 10", () => {
    const ten = sec("A", ["Nobody"], 10, t);
    const fifty = sec("A", ["Nobody"], 50, t);
    const five = sec("A", ["Nobody"], 5, t);
    expect(sectionScore(ten)).toBeCloseTo(sectionScore(fifty));
    expect(sectionScore(ten)).toBeGreaterThan(sectionScore(five));
  });

  it("uses a group's best section", () => {
    const g = [sec("A", ["Di Bad"], 5, t), sec("A", ["Ada Good"], 5, t)];
    expect(groupScore(g, { ratings, gpas })).toBeCloseTo(sectionScore(g[1]!, { ratings, gpas }));
  });

  it("ranks by rating + GPA + seats, and leaves 'best' alone", () => {
    const easy = layout("easy", [sec("A", ["Di Bad"], 30, t)]);
    const loved = layout("loved", [sec("A", ["Ada Good"], 4, t)]);
    expect(names(sortLayouts([easy, loved], "recommended", { ratings, gpas }))).toEqual(["loved", "easy"]);
    // seats separate otherwise equal layouts; "best" ignores seats and keeps input order
    const roomy = layout("roomy", [sec("A", ["Ada Good"], 12, t)]);
    expect(names(sortLayouts([loved, roomy], "recommended", { ratings, gpas }))).toEqual(["roomy", "loved"]);
    expect(names(sortLayouts([loved, roomy], "best", { ratings, gpas }))).toEqual(["loved", "roomy"]);
  });

  it("ties fall back to the best-first order", () => {
    const gappy = layout("gappy", [sec("A", ["X"], 5, at(["M"], "08:00", "08:50"), at(["M"], "15:00", "15:50"))]);
    const tight = layout("tight", [sec("A", ["X"], 5, t)]);
    expect(names(sortLayouts([gappy, tight], "recommended"))).toEqual(["tight", "gappy"]);
  });
});

import { describe, expect, it } from "vitest";
import type { Meeting } from "@turboterp/course-data/schedules";
import { blockLines, clock, dayBlocks, hourLabel, labelFit, pct, timeScale, untimed } from "../calendar";

const m = (days: string[], start: number | null, end: number | null, type = "Lecture"): Meeting => ({
  days,
  start,
  end,
  building: "IRB",
  room: "0324",
  type,
});

describe("timeScale", () => {
  it("runs from the hour before the earliest start to the hour after the latest end", () => {
    const s = timeScale([m(["M"], 9 * 60 + 30, 10 * 60 + 20), m(["F"], 14 * 60, 15 * 60 + 15)]);
    expect(s).toMatchObject({ start: 9 * 60, end: 16 * 60 });
  });

  it("labels every hour", () => {
    expect(timeScale([m(["M"], 600, 650)]).hours).toEqual([600, 660]);
    expect(timeScale([m(["M"], 480, 1270)]).hours).toHaveLength(15); // 8am … 10pm
  });

  it("ignores untimed meetings and defaults to 8am–5pm when nothing is timed", () => {
    expect(timeScale([m([], null, null)])).toMatchObject({ start: 480, end: 1020 });
  });

  it("keeps a class ending exactly on the hour inside the scale", () => {
    expect(timeScale([m(["M"], 600, 660)])).toMatchObject({ start: 600, end: 660 });
  });
});

describe("pct", () => {
  it("places a time as a percentage of the scale", () => {
    const s = { start: 480, end: 1080, hours: [] };
    expect(pct(s, 480)).toBe(0);
    expect(pct(s, 780)).toBe(50);
    expect(pct(s, 1080)).toBe(100);
  });
});

describe("clock and hourLabel", () => {
  it("formats minutes as a clock time", () => {
    expect(clock(600)).toBe("10am");
    expect(clock(12 * 60 + 30)).toBe("12:30pm");
    expect(clock(0)).toBe("12am");
  });

  it("uses a short label on the hour axis", () => {
    expect(hourLabel(480)).toBe("8a");
    expect(hourLabel(720)).toBe("12p");
    expect(hourLabel(21 * 60)).toBe("9p");
  });
});

describe("dayBlocks", () => {
  const scale = { start: 480, end: 1080, hours: [] };

  it("puts each meeting on each of its weekdays", () => {
    const days = dayBlocks([{ id: "a", meeting: m(["M", "W"], 600, 650) }], scale);
    expect(days.M).toHaveLength(1);
    expect(days.W).toHaveLength(1);
    expect(days.Tu).toHaveLength(0);
    expect(days.M[0]).toMatchObject({ id: "a", top: 20, height: (50 / 600) * 100, lane: 0, lanes: 1 });
  });

  it("gives overlapping classes side-by-side lanes (conflicts stay visible)", () => {
    const days = dayBlocks(
      [
        { id: "a", meeting: m(["M"], 600, 690) },
        { id: "b", meeting: m(["M"], 660, 720) },
        { id: "c", meeting: m(["M"], 800, 850) },
      ],
      scale,
    );
    expect(days.M.map((b) => [b.id, b.lane, b.lanes])).toEqual([
      ["a", 0, 2],
      ["b", 1, 2],
      ["c", 0, 1],
    ]);
  });

  it("marks blocks that overlap another as conflicts", () => {
    const days = dayBlocks(
      [
        { id: "a", meeting: m(["M"], 600, 690) },
        { id: "b", meeting: m(["M"], 660, 720) },
        { id: "c", meeting: m(["M"], 720, 780) },
      ],
      scale,
    );
    expect(days.M.map((b) => b.conflict)).toEqual([true, true, false]);
  });

  it("draws ghosts full width on top, without moving committed blocks into lanes", () => {
    const days = dayBlocks(
      [
        { id: "a", meeting: m(["M"], 600, 690) },
        { id: "g", meeting: m(["M"], 660, 720), ghost: true },
      ],
      scale,
    );
    expect(days.M.map((b) => [b.id, b.lane, b.lanes, b.conflict])).toEqual([
      ["a", 0, 1, false],
      ["g", 0, 1, false],
    ]);
  });

  it("leaves out untimed and weekend meetings", () => {
    const days = dayBlocks(
      [
        { id: "a", meeting: m([], null, null) },
        { id: "b", meeting: m(["Sa"], 600, 650) },
      ],
      scale,
    );
    expect(Object.values(days).flat()).toEqual([]);
  });
});

describe("untimed", () => {
  it("lists meetings the Monday–Friday grid can't show", () => {
    const list = untimed([
      { id: "a", meeting: m(["M"], 600, 650) },
      { id: "b", meeting: m([], null, null, "Lab") },
      { id: "c", meeting: m(["Sa"], 600, 650) },
    ]);
    expect(list.map((x) => x.id)).toEqual(["b", "c"]);
  });
});

describe("labelFit", () => {
  it("shows two lines when both fit, one when only the course fits, none when too short", () => {
    expect(labelFit(40, { line: 12, pad: 4 })).toBe("two");
    expect(labelFit(20, { line: 12, pad: 4 })).toBe("one");
    expect(labelFit(15, { line: 12, pad: 4 })).toBe("none");
  });

  it("never allows a line that would be clipped (exact fit counts as fitting)", () => {
    expect(labelFit(16, { line: 12, pad: 4 })).toBe("one");
    expect(labelFit(28, { line: 12, pad: 4 })).toBe("two");
    expect(labelFit(27.9, { line: 12, pad: 4 })).toBe("one");
  });
});

describe("blockLines", () => {
  it("gives gallery mini blocks no text at all, however tall (owner: color only)", () => {
    expect(blockLines("mini", 400, { line: 12, pad: 4 })).toBe("none");
    expect(blockLines("mini", 20, { line: 12, pad: 4 })).toBe("none");
  });

  it("labels larger calendars as far as the lines fit", () => {
    expect(blockLines("zoom", 40, { line: 12, pad: 4 })).toBe("two");
    expect(blockLines("large", 20, { line: 12, pad: 4 })).toBe("one");
  });
});

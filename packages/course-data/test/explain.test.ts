// Explaining an empty result: which course(s), under which filters, leave no layout.
// Expected messages are worked out by hand.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { explainNoLayouts } from "../src/explain.ts";
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
const section = (courseId: string, id: string, open: number, ...meetings: Meeting[]): Section => ({
  id,
  courseId,
  instructors: [],
  seats: { total: 30, open, waitlist: 0, holdfile: 0 },
  delivery: "f2f",
  meetings,
  notes: null,
});

describe("explainNoLayouts", () => {
  const sections = [
    section("CMSC330", "0101", 5, at(["M", "W", "F"], "09:00", "09:50")),
    section("CMSC330", "0201", 5, at(["Tu", "Th"], "12:30", "13:45")),
    section("CMSC351", "0101", 5, at(["Tu", "Th"], "12:30", "13:45")),
    section("CMSC351", "0201", 5, at(["Tu", "Th"], "15:30", "16:45")),
    section("MATH140", "0101", 5, at(["Tu", "Th"], "15:30", "16:45")),
  ];

  it("returns null when some layout exists", () => {
    expect(explainNoLayouts(["CMSC330", "CMSC351"], sections, {})).toBeNull();
  });

  it("names a course with no sections at all", () => {
    expect(explainNoLayouts(["CMSC330", "HIST999"], sections, {})).toEqual({
      message: "HIST999 has no sections this term.",
      blockers: [{ courses: ["HIST999"], filters: [], message: "HIST999 has no sections this term." }],
    });
  });

  it("names the course and the one filter it can't meet", () => {
    const result = explainNoLayouts(["CMSC330", "CMSC351"], sections, { days: { F: "off", Tu: "off" } });
    // CMSC330 fails "Friday off" (0101) and "Tuesday off" (0201), but each alone is fine;
    // CMSC351 meets only on Tu/Th, so Tuesday off alone blocks it.
    expect(result?.blockers).toEqual([
      {
        courses: ["CMSC330"],
        filters: [
          { kind: "dayOff", day: "Tu" },
          { kind: "dayOff", day: "F" },
        ],
        message: "CMSC330 has no section that avoids Tuesday and avoids Friday.",
      },
      {
        courses: ["CMSC351"],
        filters: [{ kind: "dayOff", day: "Tu" }],
        message: "CMSC351 has no section that avoids Tuesday.",
      },
    ]);
    expect(result?.message).toBe(
      "CMSC330 has no section that avoids Tuesday and avoids Friday. CMSC351 has no section that avoids Tuesday.",
    );
  });

  it("describes a workday window in plain words", () => {
    const window = { from: mins("08:00"), to: mins("13:00") };
    expect(explainNoLayouts(["CMSC351"], sections, { days: { Th: window } })?.message).toBe(
      "CMSC351 has no section that fits Thursday 8:00am–1:00pm.",
    );
  });

  describe("full sections", () => {
    const withFull = [
      section("STAT400", "0101", 0, at(["M", "W"], "10:00", "10:50")),
      section("STAT400", "0201", 0, at(["Tu", "Th"], "10:00", "10:50")),
      section("CMSC330", "0101", 5, at(["M", "W", "F"], "09:00", "09:50")),
      section("CMSC330", "0201", 0, at(["Tu", "Th"], "12:30", "13:45")),
      section("MATH140", "0101", 5, at(["M", "W"], "12:00", "12:50")),
      section("MATH140", "0201", 0, at(["Tu", "Th"], "12:00", "12:50")),
      section("CMSC351", "0101", 5, at(["M", "W"], "12:00", "12:50")),
      section("CMSC351", "0201", 5, at(["Tu", "Th"], "12:00", "12:50")),
    ];

    it("names a course whose every section is full", () => {
      expect(explainNoLayouts(["CMSC330", "STAT400"], withFull, {})).toEqual({
        message: "STAT400: every section is full.",
        blockers: [
          { courses: ["STAT400"], filters: [{ kind: "openSeats" }], message: "STAT400: every section is full." },
        ],
      });
    });

    it("says 'no open section' when only full sections would satisfy a filter", () => {
      // CMSC330-0201 avoids Friday but is full.
      expect(explainNoLayouts(["CMSC330"], withFull, { days: { F: "off" } })?.blockers).toEqual([
        {
          courses: ["CMSC330"],
          filters: [{ kind: "openSeats" }, { kind: "dayOff", day: "F" }],
          message: "CMSC330 has no open section that avoids Friday.",
        },
      ]);
    });

    it("says when courses fit together only in full sections", () => {
      // Open sections: MATH140 M/W 12:00, CMSC351 M/W or Tu/Th 12:00, ENGL101 Tu/Th 12:00, so any two fit
      // but all three collide. The full CMSC351-0301 (Friday) would make room.
      const s = [
        ...withFull,
        section("CMSC351", "0301", 0, at(["F"], "12:00", "12:50")),
        section("ENGL101", "0101", 5, at(["Tu", "Th"], "12:00", "12:50")),
      ];
      expect(explainNoLayouts(["MATH140", "CMSC351", "ENGL101"], s, {})?.message).toBe(
        "MATH140, CMSC351 and ENGL101 can't fit together in sections with open seats.",
      );
    });

    it("keeps full sections in play with includeFull", () => {
      expect(explainNoLayouts(["CMSC330", "STAT400"], withFull, { includeFull: true })).toBeNull();
    });
  });

  it("names the smallest group of courses that can't fit together when each fits on its own", () => {
    // CMSC351-0201 and MATH140-0101 overlap; with Tuesday 2:00pm-5:00pm, CMSC351 must take 0201.
    const filters = { days: { Tu: { from: mins("14:00"), to: mins("17:00") } } };
    expect(explainNoLayouts(["CMSC330", "CMSC351", "MATH140"], sections, filters)).toEqual({
      message: "CMSC351 and MATH140 can't fit together with your filters.",
      blockers: [
        {
          courses: ["CMSC351", "MATH140"],
          filters: [{ kind: "window", day: "Tu", from: mins("14:00"), to: mins("17:00") }],
          message: "CMSC351 and MATH140 can't fit together with your filters.",
        },
      ],
    });
  });

  it("says when courses always overlap, whatever the filters", () => {
    const clash = [
      section("CMSC351", "0101", 5, at(["Tu", "Th"], "15:30", "16:45")),
      section("MATH140", "0101", 5, at(["Tu", "Th"], "15:30", "16:45")),
      section("ENGL101", "0101", 5, at(["M"], "10:00", "10:50")),
    ];
    expect(explainNoLayouts(["ENGL101", "CMSC351", "MATH140"], clash, {})?.message).toBe(
      "CMSC351 and MATH140 always overlap.",
    );
  });
});

describe("explainNoLayouts on real Spring 2027 data", () => {
  const sample = JSON.parse(readFileSync(new URL("./fixtures/soc-202701-sample.json", import.meta.url), "utf8")) as {
    sections: Section[];
  };

  it("finds that CMSC351, whose every section meets MWF, is what blocks Fridays off", () => {
    expect(explainNoLayouts(["CMSC351", "STAT400", "ENGL394"], sample.sections, { days: { F: "off" } })?.message).toBe(
      "CMSC351 has no section that avoids Friday.",
    );
  });
});

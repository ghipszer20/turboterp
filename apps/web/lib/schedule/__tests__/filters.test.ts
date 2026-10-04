import { describe, expect, it } from "vitest";
import type { EmptyExplanation } from "@turboterp/course-data/explain";
import {
  applySameHours,
  DEFAULT_FILTERS,
  readQuery,
  relaxOptions,
  relaxConstraint,
  setDayOff,
  setWindow,
  toScheduleFilters,
  writeQuery,
  type FilterState,
} from "../filters";

const q = (s: string) => new URLSearchParams(s);

describe("filter state in the URL", () => {
  it("round-trips courses, days off, windows and sort", () => {
    const filters: FilterState = { days: { F: "off", M: { from: 480, to: 780 } }, sort: "fewestDays" };
    const query = writeQuery(["CMSC351", "STAT400"], filters);
    expect(readQuery(q(query))).toEqual({ courses: ["CMSC351", "STAT400"], filters });
  });

  it("writes a short, readable query", () => {
    expect(writeQuery(["CMSC351", "ENGL394"], { days: { F: "off", M: { from: 480, to: 780 } }, sort: "best" })).toBe(
      "c=CMSC351,ENGL394&off=F&win=M:480-780",
    );
  });

  it("leaves out defaults entirely", () => {
    expect(writeQuery([], DEFAULT_FILTERS)).toBe("");
  });

  it("reads only what the URL says (missing parts stay undefined)", () => {
    expect(readQuery(q("off=F"))).toEqual({ filters: { days: { F: "off" }, sort: "best" } });
    expect(readQuery(q(""))).toEqual({});
  });

  it("ignores malformed values instead of failing", () => {
    expect(readQuery(q("c=cmsc351,,BAD!&off=X,F&win=M:900-600,Tu:abc&sort=nope"))).toEqual({
      courses: ["CMSC351"],
      filters: { days: { F: "off" }, sort: "best" },
    });
  });
});

describe("editing the week", () => {
  it("toggles a day off and back to unrestricted", () => {
    const off = setDayOff(DEFAULT_FILTERS, "F", true);
    expect(off.days.F).toBe("off");
    expect(setDayOff(off, "F", false).days.F).toBeUndefined();
  });

  it("keeps a window at least an hour long", () => {
    expect(setWindow(DEFAULT_FILTERS, "M", 600, 600).days.M).toEqual({ from: 600, to: 660 });
  });

  it('"same hours every day" sets every day but keeps days off off', () => {
    const state = applySameHours(setDayOff(DEFAULT_FILTERS, "F", true), 540, 1020);
    expect(state.days).toEqual({
      M: { from: 540, to: 1020 },
      Tu: { from: 540, to: 1020 },
      W: { from: 540, to: 1020 },
      Th: { from: 540, to: 1020 },
      F: "off",
    });
  });

  it("converts to the generator's filters (full sections always excluded)", () => {
    expect(toScheduleFilters({ days: { F: "off" }, sort: "best" })).toEqual({ days: { F: "off" } });
  });
});

describe("relaxing the filter that blocks every layout", () => {
  const explanation: EmptyExplanation = {
    message: "…",
    blockers: [
      {
        courses: ["STAT400"],
        filters: [{ kind: "openSeats" }, { kind: "dayOff", day: "F" }, { kind: "window", day: "M", from: 480, to: 600 }],
        message: "…",
      },
    ],
  };

  it("offers a button for days off and windows, never for open seats", () => {
    expect(relaxOptions(explanation).map((o) => o.label)).toEqual(["Allow classes on Friday", "Any time on Monday"]);
  });

  it("removes the blocking rule", () => {
    const state: FilterState = { days: { F: "off", M: { from: 480, to: 600 } }, sort: "best" };
    const [allowFriday, anyMonday] = relaxOptions(explanation);
    expect(relaxConstraint(state, allowFriday!.constraint).days).toEqual({ M: { from: 480, to: 600 } });
    expect(relaxConstraint(state, anyMonday!.constraint).days).toEqual({ F: "off" });
  });

  it("offers each rule once even when several blockers share it", () => {
    const twice: EmptyExplanation = { message: "", blockers: [explanation.blockers[0]!, explanation.blockers[0]!] };
    expect(relaxOptions(twice)).toHaveLength(2);
  });
});

import { describe, expect, it } from "vitest";
import {
  dayChoices,
  dayWindows,
  daysWithOpenRooms,
  pickWindow,
  roomFitsSize,
  roomTypeKey,
  roomTypeLabel,
  roomTypes,
  shortLibraryName,
  timeOptions,
} from "../rooms";

describe("roomFitsSize", () => {
  it("fits a solo student (size 1) into every room, even one with unknown capacity", () => {
    expect(roomFitsSize(null, 1)).toBe(true);
    expect(roomFitsSize(1, 1)).toBe(true);
    expect(roomFitsSize(8, 1)).toBe(true);
  });

  it("requires a known capacity at least the requested size for a group", () => {
    expect(roomFitsSize(4, 4)).toBe(true);
    expect(roomFitsSize(3, 4)).toBe(false);
    expect(roomFitsSize(null, 4)).toBe(false);
  });
});

describe("shortLibraryName", () => {
  it("drops the building the library sits inside", () => {
    expect(shortLibraryName("Art Library in Art Sociology Building")).toBe("Art");
    expect(shortLibraryName("STEM Library in William E. Kirwan Hall")).toBe("STEM");
  });

  it("drops the trailing 'Library'", () => {
    expect(shortLibraryName("McKeldin Library")).toBe("McKeldin");
  });

  it("shortens Michelle Smith Performing Arts to just Performing Arts", () => {
    expect(shortLibraryName("Michelle Smith Performing Arts Library")).toBe("Performing Arts");
  });
});

describe("roomTypeLabel", () => {
  const cases: [string, string, string][] = [
    ["McKeldin Terrapin Learning Commons Group Study Rooms", "McKeldin Library", "Group study room"],
    ["STEM Library Group Study Rooms", "STEM Library in William E. Kirwan Hall", "Group study room"],
    ["McKeldin Study Carrels", "McKeldin Library", "Study carrel"],
    ["Art Library Seminar Room", "Art Library in Art Sociology Building", "Seminar room"],
    ["Performing Arts Library Seminar Rooms", "Michelle Smith Performing Arts Library", "Seminar room"],
    ["McKeldin Family Study Room 3233", "McKeldin Library", "Family room"],
    ["Podcast Lab", "McKeldin Library", "Podcast lab"],
    ["Conversation Rooms", "McKeldin Library", "Conversation room"],
  ];
  it.each(cases)("%s → %s", (cat, lib, label) => {
    expect(roomTypeLabel(cat, lib)).toBe(label);
  });
  it("falls back to a cleaned-up category name", () => {
    expect(roomTypeLabel("McKeldin Quiet Pods", "McKeldin Library")).toBe("Quiet pod");
  });
});

describe("roomTypes", () => {
  const rooms = [
    { locationId: 1, library: "McKeldin Library", category: "McKeldin Study Carrels" },
    { locationId: 1, library: "McKeldin Library", category: "McKeldin Study Carrels" },
    { locationId: 2, library: "STEM Library", category: "STEM Library Group Study Rooms" },
  ];
  it("lists each library's types once; labels name the library only for All", () => {
    expect(roomTypes(rooms, 1).map((t) => t.label)).toEqual(["Study carrel"]);
    expect(roomTypes(rooms, 0).map((t) => t.label)).toEqual(["McKeldin · Study carrel", "STEM · Group study room"]);
  });
  it("gives keys matched by roomTypeKey", () => {
    const [t] = roomTypes(rooms, 2);
    expect(t!.key).toBe(roomTypeKey(rooms[2]!));
  });
});

describe("dayChoices", () => {
  it("lists today then the next 14 days with short labels", () => {
    const days = dayChoices("2026-10-07");
    expect(days).toHaveLength(15);
    expect(days[0]).toEqual({ date: "2026-10-07", label: "Today" });
    expect(days[1]).toEqual({ date: "2026-10-08", label: "Thu 8" });
    expect(days[14]!.date).toBe("2026-10-21");
  });
});

describe("dayWindows", () => {
  const open = [
    { start: "2026-10-07 22:00:00", end: "2026-10-08 00:00:00" },
    { start: "2026-10-08 08:00:00", end: "2026-10-08 10:30:00" },
  ];
  it("keeps only that day's windows, as minutes, with midnight as 1440", () => {
    expect(dayWindows(open, "2026-10-07")).toEqual([{ start: 1320, end: 1440 }]);
    expect(dayWindows(open, "2026-10-08")).toEqual([{ start: 480, end: 630 }]);
  });
  it("clips a window that runs past midnight", () => {
    expect(dayWindows([{ start: "2026-10-07 23:00:00", end: "2026-10-08 01:00:00" }], "2026-10-07")).toEqual([
      { start: 1380, end: 1440 },
    ]);
  });
});

describe("daysWithOpenRooms", () => {
  it("returns the days on which any room has a window", () => {
    const rooms = [{ open: [{ start: "2026-10-08 08:00:00", end: "2026-10-08 09:00:00" }] }, { open: [] }];
    expect([...daysWithOpenRooms(rooms)]).toEqual(["2026-10-08"]);
  });
});

describe("pickWindow", () => {
  const open = [
    { start: "2026-10-07 09:00:00", end: "2026-10-07 11:00:00" },
    { start: "2026-10-07 14:00:00", end: "2026-10-07 17:00:00" },
  ];
  const base = { day: "2026-10-07", today: "2026-10-07", now: 600, from: null, to: null };
  it("on today, shows the window open now, else the next one", () => {
    expect(pickWindow(open, base)).toEqual({ window: { start: 540, end: 660 }, current: true });
    expect(pickWindow(open, { ...base, now: 700 })).toEqual({ window: { start: 840, end: 1020 }, current: false });
    expect(pickWindow(open, { ...base, now: 1100 })).toBeNull();
  });
  it("on another day, shows the first window and never 'current'", () => {
    const later = [{ start: "2026-10-09 08:00:00", end: "2026-10-09 09:00:00" }];
    expect(pickWindow(later, { ...base, day: "2026-10-09" })).toEqual({ window: { start: 480, end: 540 }, current: false });
  });
  it("needs one window to cover the whole range", () => {
    expect(pickWindow(open, { ...base, now: 0, from: 840, to: 960 })?.window).toEqual({ start: 840, end: 1020 });
    expect(pickWindow(open, { ...base, now: 0, from: 600, to: 900 })).toBeNull();
  });
  it("treats a lone From or To as a half-hour check", () => {
    expect(pickWindow(open, { ...base, now: 0, from: 960, to: null })).not.toBeNull();
    expect(pickWindow(open, { ...base, now: 0, from: null, to: 1050 })).toBeNull();
  });
});

describe("timeOptions", () => {
  it("steps by half hours; on today skips past times", () => {
    expect(timeOptions(null).slice(0, 3)).toEqual([0, 30, 60]);
    expect(timeOptions(610)[0]).toBe(630);
  });
});

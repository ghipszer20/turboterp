import { describe, expect, it } from "vitest";
import type { Section } from "@turboterp/course-data/schedules";
import { blockLabel, sectionBlocks } from "../block-items";

const stat: Section = {
  id: "0311",
  courseId: "STAT400",
  instructors: ["Shixin Zheng"],
  seats: { total: 30, open: 3, waitlist: 0, holdfile: 0 },
  delivery: "f2f",
  meetings: [
    { days: ["Tu", "Th"], start: 570, end: 645, building: "ARM", room: "0135", type: "Lecture" },
    { days: ["F"], start: 660, end: 710, building: "PHY", room: "2213", type: "Discussion" },
    { days: [], start: null, end: null, building: null, room: null, type: "Lab" },
  ],
};

describe("sectionBlocks", () => {
  it("labels mini-calendar blocks with the course number only", () => {
    const items = sectionBlocks(stat, { color: 1, size: "mini" });
    expect(items.map((i) => i.data!.label)).toEqual(["400", "400", "400"]);
  });

  it("labels large blocks with the course, and the room and type underneath", () => {
    const items = sectionBlocks(stat, { color: 1, size: "large" });
    expect(items.map((i) => [i.data!.label, i.data!.sub])).toEqual([
      ["STAT400", "ARM 0135"],
      ["STAT400", "PHY 2213 · Discussion"],
      ["STAT400", "Lab"],
    ]);
  });

  it("names the section on a ghost, so the preview says what it is", () => {
    const [first] = sectionBlocks(stat, { color: 1, size: "large", ghost: true });
    expect(first).toMatchObject({ ghost: true, data: { label: "STAT400 · 0311" } });
  });

  it("gives every meeting a stable id per section", () => {
    expect(sectionBlocks(stat, { color: 1, size: "large" }).map((i) => i.id)).toEqual([
      "STAT400/0311/0",
      "STAT400/0311/1",
      "STAT400/0311/2",
    ]);
  });
});

describe("blockLabel", () => {
  const items = sectionBlocks(stat, { color: 1, size: "large" });

  it("week view: course number over the room", () => {
    expect(blockLabel(items[0], "week")).toEqual({ top: "STAT400", bottom: "ARM 0135" });
  });

  it("week view: TBA when the meeting has no room", () => {
    expect(blockLabel(items[2], "week")).toEqual({ top: "STAT400", bottom: "TBA" });
  });

  it("gallery view: course number over the section id, never empty", () => {
    expect(blockLabel(items[0], "gallery")).toEqual({ top: "STAT400", bottom: "0311" });
    expect(blockLabel(items[2], "gallery")).toEqual({ top: "STAT400", bottom: "0311" });
  });

  it("a discussion meeting uses the same course number as the lecture", () => {
    expect(blockLabel(items[1], "week").top).toBe(blockLabel(items[0], "week").top);
    expect(blockLabel(items[1], "week").bottom).toBe("PHY 2213");
  });
});

import { describe, expect, it } from "vitest";
import { chooserCopy, copyLine } from "../chooser";
import { summarize } from "../summary";

describe("chooser copy", () => {
  it("words the question and buttons per document", () => {
    expect(chooserCopy("plan")).toEqual({
      title: "Replace the plan saved in your account with this one?",
      replace: "Replace it",
      keep: "Keep my saved plan",
    });
    expect(chooserCopy("schedule").title).toBe("Replace the schedule saved in your account with this one?");
    expect(chooserCopy("schedule").keep).toBe("Keep my saved schedule");
    expect(chooserCopy("registration").title).toBe("Replace the registration checklist saved in your account with this one?");
    expect(chooserCopy("registration").keep).toBe("Keep my saved checklist");
  });
  it("one muted line comparing the two copies", () => {
    const local = JSON.stringify({ programs: ["a", "b"], terms: new Array(8).fill({}) });
    const remote = JSON.stringify({ programs: ["a"], terms: [{}] });
    const name = (id: string) => ({ a: "Mathematics Major", b: "Computer Science Major" })[id] ?? id;
    expect(copyLine("plan", local, remote, name)).toBe(
      "This device: Mathematics Major, Computer Science Major, 8 terms \u00b7 Your account: Mathematics Major, 1 term",
    );
  });
});

describe("summarize", () => {
  it("plan: programs and number of terms", () => {
    const raw = JSON.stringify({ v: 1, programs: ["cs-bs"], catalogYear: "2025", startTerm: "Fall 2025", terms: [{}, {}] });
    expect(summarize("plan", raw).lines).toEqual(["cs-bs", "2 terms"]);
  });
  it("schedule and registration", () => {
    expect(summarize("schedule", JSON.stringify({ v: 1, term: "202701", courses: ["CMSC131", "MATH140"] })).lines).toEqual(["Spring 2027", "2 courses"]);
    expect(summarize("registration", JSON.stringify({ "202701": { checked: [] } })).lines).toEqual(["1 term"]);
  });
  it("bad input gives an empty summary", () => {
    expect(summarize("plan", JSON.stringify({ programs: ["cs-bs", "x"], terms: [] }), (id) => (id === "cs-bs" ? "Computer Science" : id)).lines).toEqual([
      "Computer Science, x",
      "0 terms",
    ]);
    expect(summarize("plan", "nope").lines).toEqual([]);
    expect(summarize("plan", null).lines).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import type { Section } from "@turboterp/course-data/schedules";
import { runGeneration, type GenerateRequest } from "@turboterp/app-core/schedule/generate";
import { decodeLayout } from "@turboterp/app-core/schedule/gallery";
import { emptySaved, savePlan } from "@turboterp/app-core/schedule/saved";
import { generateAsync } from "../src/schedule/generation";
import {
  indexSections,
  planAfterRemove,
  planChips,
  removeQuestion,
  saveAsPlan,
  saveCheck,
  savedNote,
  sectionRow,
  sortRequest,
  stepWindow,
  picksToSections,
} from "../src/schedule/builder-model";
import { createSavedStore } from "../src/schedule/savedStoreCore";

const sec = (courseId: string, id: string, start: number, days: string[] = ["M", "W"], open = 5, instructors = ["Prof"]): Section =>
  ({
    courseId,
    id,
    instructors,
    seats: { total: 30, open, waitlist: 0, holdfile: 0 },
    delivery: "face-to-face",
    meetings: [{ days, start, end: start + 75, building: "IRB", room: "1110", type: "Lecture" }],
  }) as unknown as Section;

const sections = [
  sec("CMSC131", "0101", 540),
  sec("CMSC131", "0102", 660),
  sec("MATH140", "0101", 540), // overlaps CMSC131 0101
  sec("MATH140", "0102", 780),
  sec("ENGL101", "0101", 900, ["Tu", "Th"]),
];
const req = (over: Partial<GenerateRequest> = {}): GenerateRequest => ({
  courseIds: ["CMSC131", "MATH140", "ENGL101"],
  sections,
  filters: {},
  sort: "best",
  ratings: { Prof: 4 },
  ...over,
});

describe("generateAsync", () => {
  it("returns the same layouts as the web's runGeneration, in the same order", async () => {
    const a = await generateAsync(req());
    const b = runGeneration(req());
    expect(a!.layouts.count).toBe(b.layouts.count);
    expect(a!.layouts.count).toBe(3);
    expect(Array.from(a!.layouts.table)).toEqual(Array.from(b.layouts.table));
    expect(a!.scale).toEqual(b.scale);
    expect(a!.truncated).toBe(false);
  });

  it("yields to the event loop between slices and honors cancellation", async () => {
    let yields = 0;
    let t = 0;
    const many = Array.from({ length: 120 }, (_, i) => sec("CMSC131", `01${i}`, 400 + i * 5));
    const out = await generateAsync(req({ sections: [...many, ...sections.slice(2)] }), {
      budgetMs: 1,
      now: () => (t += 1),
      yieldFn: async () => void yields++,
    });
    expect(out).not.toBeNull();
    let cancelled = false;
    const none = await generateAsync(req({ sections: [...many, ...sections.slice(2)] }), {
      budgetMs: 1,
      now: () => (t += 1),
      yieldFn: async () => void (cancelled = true),
      isCancelled: () => cancelled,
    });
    expect(none).toBeNull();
    expect(yields).toBeGreaterThan(0);
  });

  it("explains an empty result and caps huge ones", async () => {
    const noFit = await generateAsync(req({ filters: { days: { M: "off", W: "off" } } }));
    expect(noFit!.layouts.count).toBe(0);
    expect(noFit!.explanation).not.toBeNull();
    const capped = await generateAsync(req(), { maxLayouts: 2 });
    expect(capped!.layouts.count).toBe(2);
    expect(capped!.truncated).toBe(true);
    const empty = await generateAsync(req({ courseIds: [] }));
    expect(empty!.layouts.count).toBe(0);
  });

  it("decodes against its own sections", async () => {
    const a = await generateAsync(req());
    const byKey = indexSections(sections);
    const layout = decodeLayout(a!.layouts, 0, byKey);
    expect(layout.map((g) => g[0]!.courseId)).toEqual(["CMSC131", "MATH140", "ENGL101"]);
  });
});

describe("sort choices", () => {
  it("maps Rating and GPA to a one-sided Best Teachers ranking", () => {
    expect(sortRequest("default", { A: 4 }, { g: 3 })).toEqual({ sort: "best", ratings: { A: 4 } });
    expect(sortRequest("rating", { A: 4 }, { g: 3 })).toEqual({ sort: "recommended", ratings: { A: 4 }, gpas: {} });
    expect(sortRequest("gpa", { A: 4 }, { g: 3 })).toEqual({ sort: "recommended", ratings: {}, gpas: { g: 3 } });
    expect(sortRequest("timing", {}, {}).sort).toBe("fewestGaps");
  });

  it("ranks the highest-rated teacher first for Rating", async () => {
    const rated = [sec("CMSC131", "0101", 540, ["M"], 5, ["Low"]), sec("CMSC131", "0102", 780, ["M"], 5, ["High"])];
    const r = sortRequest("rating", { Low: 2, High: 4.8 }, {});
    const out = await generateAsync({ courseIds: ["CMSC131"], sections: rated, filters: {}, ...r });
    const first = decodeLayout(out!.layouts, 0, indexSections(rated))[0]![0]!;
    expect(first.id).toBe("0102");
  });
});

describe("plans A/B/C", () => {
  const byKey = indexSections(sections);
  const courses = ["CMSC131", "MATH140", "ENGL101"];

  it("saves under the web's storage format and shows the confirmation", () => {
    const picks = picksToSections({ CMSC131: "0101", MATH140: "0102", ENGL101: "0101" }, courses, byKey);
    const saved = saveAsPlan(emptySaved("202701"), "A", picks);
    expect(saved.plans.A).toEqual({ CMSC131: "0101", MATH140: "0102", ENGL101: "0101" });
    expect(savedNote("A")).toBe("Saved as Plan A");
  });

  it("blocks saving when picked sections overlap, and when nothing is picked", () => {
    const clash = picksToSections({ CMSC131: "0101", MATH140: "0101" }, courses, byKey);
    const check = saveCheck(clash);
    expect(check.canSave).toBe(false);
    expect(check.blockedNote).toMatch(/CMSC131/);
    expect(saveCheck({}).canSave).toBe(false);
    expect(saveCheck(picksToSections({ CMSC131: "0101", MATH140: "0102" }, courses, byKey)).canSave).toBe(true);
  });

  it("only the last saved plan is removable, with the two-tap wording", () => {
    let s = emptySaved("202701");
    s = savePlan(s, "A", { CMSC131: "0101" });
    s = savePlan(s, "B", { CMSC131: "0102" });
    const chips = planChips(s, courses);
    expect(chips.map((c) => [c.id, c.saved, c.removable])).toEqual([
      ["A", true, false],
      ["B", true, true],
      ["C", false, false],
    ]);
    expect(removeQuestion("B")).toBe("Are you sure you want to delete Plan B?");
    expect(planAfterRemove("B")).toBe("A");
    expect(planAfterRemove("A")).toBe("own");
  });

  it("a plan whose courses were dropped does not count as saved", () => {
    const s = savePlan(emptySaved("202701"), "A", { CMSC131: "0101" });
    expect(planChips(s, ["MATH140"])[0]!.saved).toBe(false);
  });
});

describe("section rows", () => {
  it("shows instructor, rating, seats, times, rooms and what it would overlap", () => {
    const placed = [sec("MATH140", "0101", 540)];
    const row = sectionRow(sec("CMSC131", "0101", 540), { Prof: 4.5 }, placed);
    expect(row).toMatchObject({ id: "0101", instructors: "Prof", rating: 4.5, seats: "5 open", lowSeats: true, rooms: "IRB 1110" });
    expect(row.clash).toEqual(["MATH140"]);
    expect(sectionRow(sec("CMSC131", "0102", 780), {}, placed).clash).toEqual([]);
  });
});

describe("day windows", () => {
  it("steps either end by an hour and keeps an hour between them", () => {
    const f0 = { days: {}, sort: "best" as const };
    const a = stepWindow(f0, "M", "from", 2);
    expect(a.days.M).toEqual({ from: 9 * 60, to: 22 * 60 });
    const b = stepWindow(a, "M", "to", -20);
    expect(b.days.M).toEqual({ from: 7 * 60, to: 8 * 60 });
    expect(stepWindow(b, "M", "from", 5).days.M).toEqual({ from: 12 * 60, to: 13 * 60 });
  });
});

describe("saved store", () => {
  const kv = () => {
    const m = new Map<string, string>();
    return { m, get: (k: string) => m.get(k) ?? null, set: (k: string, v: string) => void m.set(k, v) };
  };

  it("shares one copy between screens, persists in the web's format and notifies", () => {
    const store = createSavedStore(kv());
    let calls = 0;
    store.subscribe(() => calls++);
    store.update("202701", (s) => ({ ...s, courses: ["CMSC131"] }));
    store.update("202701", (s) => savePlan(s, "A", { CMSC131: "0101" }));
    expect(store.get("202701").courses).toEqual(["CMSC131"]);
    expect(store.get("202701").plans.A).toEqual({ CMSC131: "0101" });
    expect(calls).toBe(2);
  });

  it("reads what the web format already holds", () => {
    const k = kv();
    createSavedStore(k).update("202701", (s) => savePlan(s, "B", { MATH140: "0102" }));
    expect(createSavedStore(k).get("202701").plans.B).toEqual({ MATH140: "0102" });
  });
});

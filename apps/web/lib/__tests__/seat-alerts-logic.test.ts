import { describe, expect, it } from "vitest";
import { activeForTerm, alertText, batches, detectOpenings, matchWatches, shouldAlert, watchedCourses, type SeatState, type Watch } from "../seat-alerts/logic";

const now = new Date("2026-10-09T18:00:00Z");
const w = (p: Partial<Watch>): Watch => ({ id: "w1", userId: "u1", term: "202701", courseId: "CMSC351", sectionId: "0201", lastAlertAt: null, doneAt: null, ...p });
const st = (sectionId: string, open: number, extra: Partial<SeatState> = {}): SeatState => ({ courseId: "CMSC351", sectionId, open, waitlist: 0, holdfile: 0, checkedAt: "2026-10-09T17:59:00Z", ...extra });

describe("detectOpenings", () => {
  it("finds 0 -> >0 and saves every fetched section", () => {
    const prev = new Map([["CMSC351-0201", st("0201", 0)], ["CMSC351-0101", st("0101", 2)]]);
    const r = detectOpenings(prev, [{ courseId: "CMSC351", sectionId: "0201", open: 1, waitlist: 0, holdfile: 0 }, { courseId: "CMSC351", sectionId: "0101", open: 3, waitlist: 0, holdfile: 0 }], now);
    expect(r.openings.map((o) => o.sectionId)).toEqual(["0201"]);
    expect(r.save).toHaveLength(2);
  });
  it("treats a first sighting as a baseline, not an opening", () => {
    expect(detectOpenings(new Map(), [{ courseId: "CMSC351", sectionId: "0201", open: 4, waitlist: 0, holdfile: 0 }], now).openings).toEqual([]);
  });
  it("leaves sections missing from the response untouched (Testudo outage)", () => {
    const prev = new Map([["CMSC351-0201", st("0201", 0)]]);
    expect(detectOpenings(prev, [], now)).toEqual({ save: [], openings: [] });
  });
});

describe("matching", () => {
  const opening = { courseId: "CMSC351", sectionId: "0201", open: 1, waitlist: 0, holdfile: 0 };
  it("matches section and any-section watches, one per user per opening", () => {
    const watches = [w({ id: "a" }), w({ id: "b", sectionId: null }), w({ id: "c", userId: "u2", sectionId: null }), w({ id: "d", sectionId: "0101" })];
    expect(matchWatches([opening], watches, now).map((m) => m.watch.id).sort()).toEqual(["a", "c"]);
  });
  it("respects the 15-minute cooldown and done watches", () => {
    expect(shouldAlert(w({ lastAlertAt: "2026-10-09T17:50:00Z" }), now)).toBe(false);
    expect(shouldAlert(w({ lastAlertAt: "2026-10-09T17:44:00Z" }), now)).toBe(true);
    expect(shouldAlert(w({ doneAt: "2026-10-09T17:00:00Z" }), now)).toBe(false);
  });
  it("only watches of the current term count", () => {
    expect(activeForTerm([w({}), w({ id: "old", term: "202608" })], "202701").map((x) => x.id)).toEqual(["w1"]);
  });
});

describe("batching and wording", () => {
  it("batches 40 courses per request, sorted and unique", () => {
    const many = Array.from({ length: 85 }, (_, i) => w({ id: String(i), courseId: `CMSC${String(100 + i)}` }));
    expect(watchedCourses([...many, many[0]!])).toHaveLength(85);
    expect(batches(watchedCourses(many)).map((b) => b.length)).toEqual([40, 40, 5]);
  });
  it("words the alert with and without a waitlist", () => {
    expect(alertText({ courseId: "CMSC351", sectionId: "0201", open: 1, waitlist: 0, holdfile: 0 })).toEqual({ title: "CMSC351 0201 has 1 open seat", body: "Register on Testudo now. Waitlist: 0." });
    expect(alertText({ courseId: "CMSC351", sectionId: "0201", open: 2, waitlist: 3, holdfile: 0 })).toEqual({ title: "CMSC351 0201 has 2 open seats", body: "Waitlisted students may get it first. Waitlist: 3." });
  });
});

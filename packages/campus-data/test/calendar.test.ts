import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { afterEach, vi } from "vitest";
import { fetchAcademicCalendar, listCalendarTerms, parseAcademicCalendar } from "../src/calendar.ts";

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");
const spring = fixture("academic-calendar-447.html");
const fall = fixture("academic-calendar-435.html");

describe("listCalendarTerms", () => {
  it("reads the term picker", () => {
    const terms = listCalendarTerms(spring);
    expect(terms.slice(0, 3)).toEqual([
      { id: "447", name: "Spring 2027" },
      { id: "435", name: "Fall 2026" },
      { id: "424", name: "Spring 2026" },
    ]);
  });
});

describe("parseAcademicCalendar", () => {
  const find = (events: ReturnType<typeof parseAcademicCalendar>, kind: string) => events.find((e) => e.kind === kind);

  it("classifies Spring 2027", () => {
    const ev = parseAcademicCalendar(spring, "Spring 2027");
    expect(find(ev, "drop-w")).toMatchObject({ term: "Spring 2027", label: "Last day to drop a course with a W (undergraduate students only)", start: "2027-04-13" });
    expect(find(ev, "finals")).toMatchObject({ start: "2027-05-13", end: "2027-05-20" });
    expect(find(ev, "apply-to-graduate")).toMatchObject({ start: "2027-02-09" });
    expect(find(ev, "pass-fail")).toMatchObject({ start: "2027-02-09", derived: true });
    expect(find(ev, "schedule-adjustment")).toMatchObject({ start: "2027-01-27", end: "2027-02-09" });
    expect(find(ev, "first-day")?.start).toBe("2027-01-27");
    expect(find(ev, "last-class")?.start).toBe("2027-05-11");
    expect(find(ev, "early-registration")).toMatchObject({ start: "2026-11-02", end: "2026-12-10" });
    expect(find(ev, "registration-appointments")?.start).toBe("2026-10-09");
    expect(find(ev, "priority-registration")?.start).toBe("2026-10-29");
    expect(ev.filter((e) => e.kind === "drop-w")).toHaveLength(1);
    expect(ev.find((e) => e.label === "Spring Break - No classes")).toMatchObject({ kind: "other" });
  });

  it("keeps title suffixes and the registrar's description", () => {
    const ev = parseAcademicCalendar(fall, "Fall 2026");
    expect(ev.find((e) => e.label.startsWith("Labor Day"))?.label).toBe("Labor Day - University closed");
    const mid = ev.find((e) => e.label.startsWith("Mid-term grades"))!;
    expect(mid.label).toBe("Mid-term grades become available (undergraduate students only)");
    expect(mid.description).toBeTruthy();
    expect(mid.description).not.toContain("Mid-term grades become available");
    const sp = parseAcademicCalendar(spring, "Spring 2027");
    const reg = sp.find((e) => e.kind === "registration-appointments")!;
    expect(reg.label).toBe("Registration appointment and blocks available");
    expect(reg.description).toMatch(/^Students can view the day and time/);
    expect(reg.description).toContain("Testudo Drop/Add");
    expect(reg.description).not.toMatch(/\s{2}/);
    expect(sp.find((e) => e.label === "Spring Break - No classes")?.description).toBeUndefined();
  });

  it("classifies Fall 2026", () => {
    const ev = parseAcademicCalendar(fall, "Fall 2026");
    expect(find(ev, "drop-w")?.start).toBe("2026-11-11");
    expect(find(ev, "finals")).toMatchObject({ start: "2026-12-14", end: "2026-12-21" });
    expect(find(ev, "apply-to-graduate")?.start).toBe("2026-09-14");
    expect(find(ev, "pass-fail")).toMatchObject({ start: "2026-09-14", derived: true });
  });
});

describe("fetchAcademicCalendar", () => {
  afterEach(() => vi.restoreAllMocks());

  const old = '<table><tbody><tr><td><strong>Old</strong></td><td>Jan 5, 2020 (Sun)</td></tr></tbody></table>';
  const stub = (pages: Record<string, string>) =>
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const id = /target_id=(\d+)/.exec(String(input))?.[1] ?? "447";
      if (pages[id] === "fail") return new Response("nope", { status: 500 });
      return new Response(pages[id] ?? old, { status: 200 });
    });

  it("fetches every listed term that has not fully passed", async () => {
    stub({ "447": spring, "435": fall });
    const terms = new Set((await fetchAcademicCalendar("2026-10-04")).map((e) => e.term));
    expect(terms).toEqual(new Set(["Spring 2027", "Fall 2026"]));
  });

  it("drops a term whose dates are all before today", async () => {
    stub({ "447": spring });
    const terms = new Set((await fetchAcademicCalendar("2026-10-04")).map((e) => e.term));
    expect(terms).toEqual(new Set(["Spring 2027"]));
  });

  it("keeps the other terms when one page fails", async () => {
    stub({ "447": spring, "435": "fail" });
    const terms = new Set((await fetchAcademicCalendar("2026-10-04")).map((e) => e.term));
    expect(terms).toEqual(new Set(["Spring 2027"]));
  });

  it("throws when no term loads", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response("nope", { status: 500 }));
    await expect(fetchAcademicCalendar("2026-10-04")).rejects.toThrow();
  });
});

import { describe, expect, it } from "vitest";
import type { AcademicEvent } from "@turboterp/campus-data";
import { clockAt } from "@turboterp/app-core/campus-clock";
import { SAVED_KEY } from "@turboterp/app-core/schedule/saved";
import {
  dateLabel,
  diningTiles,
  heroModel,
  isOfflineError,
  isTodayPayload,
  seatAlertsCard,
  upcomingDates,
  type TodayPayload,
} from "../src/today/model";
import { loadPickedSections, walkBetween } from "../src/today/schedule";

const clock = { today: "2026-10-31", tomorrow: "2026-11-01", minutes: 12 * 60 };
const ev = (start: string, label: string, kind: AcademicEvent["kind"] = "finals", end?: string): AcademicEvent => ({
  term: "Fall 2026",
  kind,
  label,
  start,
  ...(end ? { end } : {}),
});
const menu = (hallId: number) => ({
  ok: true as const,
  data: {
    hallId,
    date: "2026-10-31",
    meals: [{ name: "Lunch", stations: [{ name: "Grill", items: [{ name: "Burger", labelUrl: null, diets: [], contains: [] }] }] }],
  },
});
const payload: TodayPayload = {
  calendar: { ok: true, data: [ev("2026-10-01", "Old", "pass-fail"), ev("2026-11-10", "Finals", "finals", "2026-11-14"), ev("2026-11-02", "Drop", "drop-w")] },
  dining: { ok: true, data: { days: { "2026-10-31": [menu(19), { ok: false, error: "x" }, menu(51)] } } },
  stamp: { ok: false, error: "down" },
};

describe("today model", () => {
  it("checks the payload shape", () => {
    expect(isTodayPayload(payload)).toBe(true);
    expect(isTodayPayload({ calendar: {} })).toBe(false);
    expect(isTodayPayload(null)).toBe(false);
  });
  it("labels the campus date", () => {
    expect(dateLabel(clock)).toBe("Saturday, October 31");
  });
  it("builds dining tiles by the current meal and marks missing menus", () => {
    const t = diningTiles(payload, clock);
    expect(t.map((x) => x.title)).toEqual(["Yahentamitsi", "South Campus", "251 North"]);
    expect(t[0]!.sub).toBe("Lunch: Burger");
    expect(t[1]!.sub).toBe("Menu unavailable");
  });
  it("omits Stamp when its data is down and survives a dead dining source", () => {
    expect(diningTiles(payload, clock).some((x) => x.key === "stamp")).toBe(false);
    const dead: TodayPayload = { ...payload, dining: { ok: false, error: "x" } };
    expect(diningTiles(dead, clock).every((x) => x.sub === "Menu unavailable")).toBe(true);
  });
  it("lists upcoming dates soonest first, without past ones", () => {
    const d = upcomingDates(payload, clock);
    expect(d.map((x) => x.sub)).toEqual(["Nov 2", "Nov 10–14"]);
  });
  it("builds the hero with leave-by, up next, or the prompt", () => {
    expect(heroModel({ courseId: "CMSC216", start: "2:00 PM", room: "IRB 0324", leaveBy: "1:46 PM", from: "ESJ" }, null)).toEqual({
      label: "Next class",
      title: "CMSC216 · 2:00 PM",
      sub: "IRB 0324 · leave by 1:46 from ESJ",
      href: "/schedule",
    });
    expect(heroModel(null, { key: "k", title: "Finals", sub: "Nov 10" })).toEqual({ label: "Up next", title: "Finals", sub: "Nov 10" });
    expect(heroModel(null, null).title).toBe("No class left today");
  });
  it("shows the Seat Alerts card only while watching", () => {
    expect(seatAlertsCard(0)).toBeNull();
    expect(seatAlertsCard(2)).toEqual({ title: "Seat Alerts: 2 watching", sub: "We'll notify you when a seat opens." });
  });
  it("tells offline errors apart", () => {
    expect(isOfflineError("Network request failed")).toBe(true);
    expect(isOfflineError("Request failed (500)")).toBe(false);
  });
  it("recomputes the clock text from a later time", () => {
    expect(clockAt(new Date("2026-10-31T16:00:00Z")).today).toBe("2026-10-31");
  });
});

describe("saved schedule loader", () => {
  const kv = (raw: string | null) => ({ get: () => raw, set: () => undefined, remove: () => undefined });
  it("is null with no saved schedule or no picks", async () => {
    expect(await loadPickedSections(kv(null), async () => null)).toBeNull();
    expect(await loadPickedSections(kv(JSON.stringify({ v: 1, term: "202608" })), async () => null)).toBeNull();
    expect(await loadPickedSections(kv("not json"), async () => null)).toBeNull();
  });
  it("tolerates failed section fetches", async () => {
    const raw = JSON.stringify({ v: 1, term: "202608", courses: null, filters: {}, plans: {}, own: { CMSC216: "0101" } });
    const seen: string[] = [];
    const out = await loadPickedSections(kv(raw), async (p) => {
      seen.push(p);
      throw new Error("offline");
    });
    expect(out).toEqual([]);
    expect(seen).toEqual(["/api/schedule/202608/sections/CMSC"]);
    expect(SAVED_KEY).toBe("turboterp-schedule");
  });
  it("gives no walk time for unknown buildings", () => {
    expect(walkBetween([])("ESJ", "IRB")).toBeNull();
  });
});

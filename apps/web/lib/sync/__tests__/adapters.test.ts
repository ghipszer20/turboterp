import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function fakeStorage(blocked = false) {
  const m = new Map<string, string>();
  const guard = () => {
    if (blocked) throw new Error("blocked");
  };
  return {
    m,
    getItem: (k: string) => (guard(), m.get(k) ?? null),
    setItem: (k: string, v: string) => (guard(), void m.set(k, v)),
    removeItem: (k: string) => (guard(), void m.delete(k)),
  };
}
function stubBrowser(blocked = false) {
  const ls = fakeStorage(blocked);
  vi.stubGlobal("window", { localStorage: ls, addEventListener() {}, removeEventListener() {} });
  vi.stubGlobal("localStorage", ls);
  vi.stubGlobal("location", { search: "" });
  return ls;
}

const PLAN = JSON.stringify({ v: 1, programs: [], catalogYear: "2025", startTerm: "Fall 2025", terms: [{ term: "Fall 2025", courses: [] }] });

beforeEach(() => vi.resetModules());
afterEach(() => vi.unstubAllGlobals());

describe("store change hooks", () => {
  it("a plan, schedule and prep change each call localChanged", async () => {
    stubBrowser();
    const hooks = await import("../hooks");
    const spy = vi.fn();
    hooks.setLocalChangedListener(spy);
    const { savePlan, replacePlanFromRemote } = await import("@/app/advisor/store");
    const { savedStore } = await import("@/lib/schedule/saved-store");
    const { prepStore } = await import("@/lib/schedule/registration-store");
    replacePlanFromRemote(PLAN);
    savePlan(JSON.parse(PLAN));
    savedStore.write(JSON.stringify({ v: 1, term: "202701" }));
    prepStore.update((p) => ({ ...p, "202701": { checked: [] } }));
    expect(spy.mock.calls.map((c) => c[0])).toEqual(["plan", "schedule", "registration"]);
  });
  it("replacing from the account does not report a local change", async () => {
    stubBrowser();
    const hooks = await import("../hooks");
    const spy = vi.fn();
    hooks.setLocalChangedListener(spy);
    const { replacePlanFromRemote } = await import("@/app/advisor/store");
    const { savedStore } = await import("@/lib/schedule/saved-store");
    replacePlanFromRemote(PLAN);
    savedStore.replace(JSON.stringify({ v: 1, term: "202701" }));
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("app adapters", () => {
  it("sign-out clearing removes the three keys and tells subscribers", async () => {
    const ls = stubBrowser();
    const { createDocAdapters } = await import("../adapters");
    const { PLAN_STORAGE_KEY } = await import("@/lib/advisor/storage");
    const docs = createDocAdapters();
    docs.plan.replace(PLAN);
    docs.schedule.replace(JSON.stringify({ v: 1, term: "202701" }));
    docs.registration.replace(JSON.stringify({ "202701": { checked: [] } }));
    expect(ls.m.has(PLAN_STORAGE_KEY) && ls.m.has("turboterp-schedule") && ls.m.has("turboterp-registration")).toBe(true);
    const { savedStore } = await import("@/lib/schedule/saved-store");
    const notified = vi.fn();
    savedStore.subscribe(notified);
    for (const k of ["plan", "schedule", "registration"] as const) docs[k].replace(null);
    expect([...ls.m.keys()]).toEqual([]);
    expect(notified).toHaveBeenCalled();
    expect(docs.plan.read()).toBeNull();
  });
  it("validates with the real parsers", async () => {
    stubBrowser();
    const { createDocAdapters } = await import("../adapters");
    const d = createDocAdapters();
    expect(d.plan.validate(PLAN)).toBe(true);
    expect(d.plan.validate('{"v":2}')).toBe(false);
    expect(d.schedule.validate(JSON.stringify({ v: 1, term: "202701", courses: null, own: {} }))).toBe(true);
    expect(d.schedule.validate('{"v":1}')).toBe(false);
    expect(d.schedule.validate("junk")).toBe(false);
    expect(d.registration.validate("{}")).toBe(true);
    expect(d.registration.validate("[1]")).toBe(false);
  });
  it("storage blocked: still reads back what was saved, from memory", async () => {
    stubBrowser(true);
    const { createDocAdapters } = await import("../adapters");
    const d = createDocAdapters();
    d.plan.replace(PLAN);
    d.schedule.replace(JSON.stringify({ v: 1, term: "202701" }));
    expect(d.plan.read()).not.toBeNull();
    expect(d.schedule.read()).not.toBeNull();
    d.plan.replace(null);
    expect(d.plan.read()).toBeNull();
  });
});

import { describe, expect, it, vi } from "vitest";
import { PLAN_STORAGE_KEY, parsePlan, serializePlan } from "@turboterp/app-core/storage";
import { TEST_STUDENTS } from "@turboterp/app-core/test-students";
import type { KeyValueStore } from "@turboterp/app-core/key-value-store";
import { createAdvisorPlanStore } from "../src/advisor/store-core";

function memoryKv(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, get: (k) => data.get(k) ?? null, set: (k, v) => void data.set(k, v), remove: (k) => void data.delete(k) };
}
const sample = TEST_STUDENTS[0]!.plan;

describe("advisor plan store", () => {
  it("is empty with nothing saved", () => {
    expect(createAdvisorPlanStore({ kv: memoryKv(), onLocalChange: vi.fn() }).get()).toBeNull();
  });

  it("reads a plan the web wrote (same key and format)", () => {
    const kv = memoryKv();
    kv.data.set(PLAN_STORAGE_KEY, serializePlan(sample));
    expect(createAdvisorPlanStore({ kv, onLocalChange: vi.fn() }).get()).toEqual(parsePlan(serializePlan(sample)));
  });

  it("save writes the web's key and format, notifies sync and subscribers", () => {
    const kv = memoryKv();
    const onLocalChange = vi.fn();
    const store = createAdvisorPlanStore({ kv, onLocalChange });
    const listener = vi.fn();
    store.subscribe(listener);
    store.save(sample);
    expect(kv.data.get(PLAN_STORAGE_KEY)).toBe(serializePlan(sample));
    expect(onLocalChange).toHaveBeenCalledWith("plan");
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.readRaw()).toBe(serializePlan(sample));
  });

  it("dispatch edits through the plan reducer and notifies sync once per change", () => {
    const kv = memoryKv();
    const onLocalChange = vi.fn();
    const store = createAdvisorPlanStore({ kv, onLocalChange });
    store.save(sample);
    onLocalChange.mockClear();
    const term = sample.terms[0]!.name;
    store.dispatch({ type: "add-course", term, id: "ARTT100" });
    expect(store.get()!.terms[0]!.courses.some((c) => c.id === "ARTT100")).toBe(true);
    expect(parsePlan(kv.data.get(PLAN_STORAGE_KEY)!)!.terms[0]!.courses.some((c) => c.id === "ARTT100")).toBe(true);
    expect(onLocalChange).toHaveBeenCalledTimes(1);
    store.dispatch({ type: "add-course", term, id: "ARTT100" }); // already there: no change
    expect(onLocalChange).toHaveBeenCalledTimes(1);
  });

  it("dispatch without a plan does nothing", () => {
    const onLocalChange = vi.fn();
    createAdvisorPlanStore({ kv: memoryKv(), onLocalChange }).dispatch({ type: "add-term", name: "Fall 2030" });
    expect(onLocalChange).not.toHaveBeenCalled();
  });

  it("refresh picks up a plan sync wrote, without re-saving", () => {
    const kv = memoryKv();
    const onLocalChange = vi.fn();
    const store = createAdvisorPlanStore({ kv, onLocalChange });
    expect(store.get()).toBeNull();
    kv.data.set(PLAN_STORAGE_KEY, serializePlan(sample));
    const listener = vi.fn();
    store.subscribe(listener);
    store.refresh();
    expect(store.get()).not.toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(onLocalChange).not.toHaveBeenCalled();
  });
});

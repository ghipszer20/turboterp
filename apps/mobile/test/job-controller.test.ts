import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createJobController } from "../src/advisor/job-controller";
import type { EngineResult } from "../src/engine/protocol";

const ok = <T,>(value: T): EngineResult<T> => ({ ok: true, value });

function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("createJobController", () => {
  it("waits for the delay, runs once, then reports the result", async () => {
    const run = vi.fn(async (n: number) => ok(n * 2));
    const c = createJobController<number, number>({ run, delayMs: 300, available: true, keyOf: String });
    c.request(1);
    c.request(2);
    expect(c.get().status).toBe("idle");
    await vi.advanceTimersByTimeAsync(300);
    expect(run).toHaveBeenCalledTimes(1);
    expect(c.get()).toMatchObject({ status: "ready", result: 4 });
  });

  it("keeps the last result while recomputing", async () => {
    const d = deferred<EngineResult<number>>();
    const run = vi.fn().mockResolvedValueOnce(ok(1)).mockReturnValueOnce(d.promise);
    const c = createJobController<number, number>({ run, delayMs: 10, available: true, keyOf: String });
    c.request(1);
    await vi.advanceTimersByTimeAsync(10);
    c.request(2);
    await vi.advanceTimersByTimeAsync(10);
    expect(c.get()).toMatchObject({ status: "running", result: 1 });
    d.resolve(ok(2));
    await vi.advanceTimersByTimeAsync(0);
    expect(c.get()).toMatchObject({ status: "ready", result: 2 });
  });

  it("ignores a repeat of the same input and a slower, older run", async () => {
    const slow = deferred<EngineResult<number>>();
    const run = vi.fn().mockReturnValueOnce(slow.promise).mockResolvedValueOnce(ok(2));
    const c = createJobController<number, number>({ run, delayMs: 10, available: true, keyOf: String });
    c.request(1);
    c.request(1);
    await vi.advanceTimersByTimeAsync(10);
    c.request(2);
    await vi.advanceTimersByTimeAsync(10);
    slow.resolve(ok(1));
    await vi.advanceTimersByTimeAsync(0);
    expect(run).toHaveBeenCalledTimes(2);
    expect(c.get()).toMatchObject({ status: "ready", result: 2 });
  });

  it("keeps the old result on an engine error and can retry the same input", async () => {
    const run = vi
      .fn()
      .mockResolvedValueOnce(ok(1))
      .mockResolvedValueOnce({ ok: false, error: { code: "timeout", message: "slow" } })
      .mockResolvedValueOnce(ok(3));
    const c = createJobController<number, number>({ run, delayMs: 1, available: true, keyOf: String });
    c.request(1);
    await vi.advanceTimersByTimeAsync(1);
    c.request(2);
    await vi.advanceTimersByTimeAsync(1);
    expect(c.get()).toMatchObject({ status: "error", result: 1, message: "slow" });
    c.retry();
    await vi.advanceTimersByTimeAsync(1);
    expect(c.get()).toMatchObject({ status: "ready", result: 3 });
  });

  it("is unavailable at once, without running, when the engine is inert", () => {
    const run = vi.fn();
    const c = createJobController<number, number>({ run, delayMs: 1, available: false, keyOf: String });
    c.request(1);
    expect(c.get().status).toBe("unavailable");
    expect(run).not.toHaveBeenCalled();
  });

  it("request(null) clears the pending run and the result", async () => {
    const run = vi.fn(async () => ok(1));
    const c = createJobController<number, number>({ run, delayMs: 5, available: true, keyOf: String });
    c.request(1);
    c.request(null);
    await vi.advanceTimersByTimeAsync(5);
    expect(run).not.toHaveBeenCalled();
    expect(c.get()).toMatchObject({ status: "idle", result: null });
  });

  it("notifies subscribers", async () => {
    const c = createJobController<number, number>({ run: async (n) => ok(n), delayMs: 1, available: true, keyOf: String });
    const seen: string[] = [];
    c.subscribe(() => seen.push(c.get().status));
    c.request(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(seen).toEqual(["running", "ready"]);
  });
});

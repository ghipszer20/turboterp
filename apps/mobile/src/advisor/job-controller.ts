// Runs one engine job at a time for a screen: debounced, "latest input wins", and the last good
// result stays on screen while a new one is computed. Pure (no React Native, no engine import), so
// it is unit-tested in Node; analysis.ts wires it to the engine and to React.
import type { EngineResult } from "../engine/protocol";

export type JobStatus = "idle" | "running" | "ready" | "error" | "unavailable";
export type JobState<T> = { status: JobStatus; result: T | null; message: string | null };

export type JobController<I, T> = {
  get(): JobState<T>;
  subscribe(listener: () => void): () => void;
  /** Ask for a result for this input (null: nothing to compute). The same input twice is a no-op. */
  request(input: I | null): void;
  /** Run the last input again, e.g. after an error. */
  retry(): void;
};

export function createJobController<I, T>(opts: {
  run: (input: I) => Promise<EngineResult<T>>;
  delayMs: number;
  /** False where the engine is inert (the web export): the state is "unavailable" and nothing runs. */
  available: boolean;
  keyOf: (input: I) => string;
}): JobController<I, T> {
  let state: JobState<T> = { status: "idle", result: null, message: null };
  let lastKey: string | null = null;
  let lastInput: I | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let token = 0;
  const listeners = new Set<() => void>();
  const set = (next: JobState<T>) => {
    state = next;
    for (const l of listeners) l();
  };

  const schedule = (input: I) => {
    clearTimeout(timer);
    const mine = ++token;
    if (!opts.available) {
      set({ status: "unavailable", result: null, message: null });
      return;
    }
    timer = setTimeout(async () => {
      set({ ...state, status: "running" });
      let res: EngineResult<T>;
      try {
        res = await opts.run(input);
      } catch (e) {
        res = { ok: false, error: { code: "engine-failed", message: String((e as Error)?.message ?? e) } };
      }
      if (mine !== token) return;
      if (res.ok) set({ status: "ready", result: res.value, message: null });
      else set({ status: "error", result: state.result, message: res.error.message });
    }, opts.delayMs);
  };

  return {
    get: () => state,
    subscribe(l) {
      listeners.add(l);
      return () => void listeners.delete(l);
    },
    request(input) {
      if (input === null) {
        clearTimeout(timer);
        token++;
        lastKey = null;
        lastInput = null;
        if (state.status !== "idle" || state.result) set({ status: "idle", result: null, message: null });
        return;
      }
      const key = opts.keyOf(input);
      if (key === lastKey) return;
      lastKey = key;
      lastInput = input;
      schedule(input);
    },
    retry() {
      if (lastInput !== null) schedule(lastInput);
    },
  };
}

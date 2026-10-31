// Engine client: queues jobs (one at a time, so the page never holds two big jobs in memory), waits
// for the page's "ready", enforces a timeout per job, and recovers when iOS kills the WebView
// (onContentProcessDidTerminate): reload, then retry the interrupted job once. Pure logic over an
// EngineTransport, so it is tested with a fake WebView; EngineHost wires the real one.
import {
  checkJobSize,
  engineError,
  TIMEOUT_MS,
  type EngineError,
  type EngineResult,
  type Job,
  type JobResult,
  type JobType,
  type Request,
} from "./protocol";

export interface EngineTransport {
  /** Posts a JSON string into the page. */
  send(text: string): void;
  /** Loads the page again from scratch (after a crash or a hung job). */
  reload(): void;
}

export type EngineClientOptions = {
  timeouts?: Partial<Record<JobType, number>>;
  /** How long a (re)loading page may take to say "ready" before queued jobs fail. */
  readyTimeoutMs?: number;
};

type Entry = { id: number; job: Job; attempts: number; resolve: (r: EngineResult<never>) => void };

export type EngineClient = {
  run<T extends Job["type"]>(job: Extract<Job, { type: T }>): Promise<EngineResult<JobResult<T>>>;
  /** Wire to the WebView's onMessage (the raw string). */
  handleMessage(text: string): void;
  /** Wire to onContentProcessDidTerminate (and onError for a failed load). */
  handleTerminated(): void;
  /** True once the page has said ready. */
  isReady(): boolean;
};

export function createEngineClient(transport: EngineTransport, options: EngineClientOptions = {}): EngineClient {
  const readyTimeoutMs = options.readyTimeoutMs ?? 30_000;
  let ready = false;
  let nextId = 1;
  let current: Entry | null = null;
  let jobTimer: ReturnType<typeof setTimeout> | undefined;
  let readyTimer: ReturnType<typeof setTimeout> | undefined;
  let readyReloads = 0;
  const queue: Entry[] = [];

  const finish = (entry: Entry, result: EngineResult<unknown>) => {
    clearTimeout(jobTimer);
    if (current === entry) current = null;
    entry.resolve(result as EngineResult<never>);
  };

  const failQueue = (error: EngineError) => {
    for (const e of queue.splice(0)) e.resolve({ ok: false, error });
  };

  const armReadyTimer = () => {
    clearTimeout(readyTimer);
    readyTimer = setTimeout(() => {
      readyTimer = undefined;
      if (readyReloads < 1 && (queue.length || current)) {
        readyReloads++;
        reload();
        return;
      }
      if (current) finish(current, engineError("unavailable", "The engine did not start."));
      failQueue(engineError("unavailable", "The engine did not start.").error);
    }, readyTimeoutMs);
  };
  const reload = () => {
    ready = false;
    armReadyTimer();
    transport.reload();
  };

  const pump = () => {
    if (current || !ready) return;
    const entry = queue.shift();
    if (!entry) return;
    current = entry;
    const limit = options.timeouts?.[entry.job.type] ?? TIMEOUT_MS[entry.job.type];
    jobTimer = setTimeout(() => {
      // A hung job may be stuck in WASM: drop the page and start a clean one for the next job.
      finish(entry, engineError("timeout", "That took too long and was stopped."));
      reload();
    }, limit);
    transport.send(JSON.stringify({ id: entry.id, job: entry.job } satisfies Request));
  };

  return {
    run(job) {
      const tooBig = checkJobSize(job);
      if (tooBig) return Promise.resolve(tooBig);
      return new Promise((resolve) => {
        queue.push({ id: nextId++, job, attempts: 0, resolve: resolve as Entry["resolve"] });
        if (!ready && !readyTimer) armReadyTimer();
        pump();
      });
    },

    handleMessage(text) {
      let msg: { id?: unknown; ready?: unknown; ok?: unknown; result?: unknown; error?: EngineError };
      try {
        msg = JSON.parse(text);
      } catch {
        return;
      }
      if (!msg || typeof msg !== "object") return;
      if (msg.ready === true) {
        ready = true;
        readyReloads = 0;
        clearTimeout(readyTimer);
        readyTimer = undefined;
        pump();
        return;
      }
      if (!current || msg.id !== current.id) return; // a late answer for a job already given up on
      if (msg.ok === true) finish(current, { ok: true, value: msg.result });
      else finish(current, { ok: false, error: msg.error ?? { code: "engine-failed", message: "The engine failed." } });
      pump();
    },

    handleTerminated() {
      const interrupted = current;
      clearTimeout(jobTimer);
      current = null;
      if (interrupted) {
        if (interrupted.attempts >= 1) interrupted.resolve(engineError("terminated", "The engine was stopped by the system.") as EngineResult<never>);
        else {
          interrupted.attempts++;
          queue.unshift(interrupted);
        }
      }
      reload();
    },

    isReady: () => ready,
  };
}

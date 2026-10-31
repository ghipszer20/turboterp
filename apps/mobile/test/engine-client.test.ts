import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createEngineClient } from "../src/engine/client";
import { LIMITS, type Job } from "../src/engine/protocol";

const pdfJob: Job = { type: "transcriptPdf", pdfBase64: "AAAA" };

function fake() {
  const sent: { id: number; job: Job }[] = [];
  let reloads = 0;
  const t = { send: (s: string) => sent.push(JSON.parse(s)), reload: () => void reloads++ };
  const client = createEngineClient(t, { timeouts: { transcriptPdf: 1000 }, readyTimeoutMs: 5000 });
  const ready = () => client.handleMessage(JSON.stringify({ ready: true }));
  const answer = (id: number, result: unknown) => client.handleMessage(JSON.stringify({ id, ok: true, result }));
  return { client, sent, ready, answer, reloads: () => reloads };
}

describe("engine client", () => {
  beforeEach(() => void vi.useFakeTimers());
  afterEach(() => void vi.useRealTimers());

  it("waits for ready, then sends queued jobs one at a time", async () => {
    const f = fake();
    const a = f.client.run(pdfJob);
    const b = f.client.run(pdfJob);
    expect(f.sent).toHaveLength(0);
    f.ready();
    expect(f.sent).toHaveLength(1);
    f.answer(f.sent[0]!.id, { text: "a" });
    expect(await a).toEqual({ ok: true, value: { text: "a" } });
    expect(f.sent).toHaveLength(2);
    f.answer(f.sent[1]!.id, { text: "b" });
    expect(await b).toEqual({ ok: true, value: { text: "b" } });
  });

  it("returns the page's error as a value", async () => {
    const f = fake();
    f.ready();
    const p = f.client.run(pdfJob);
    f.client.handleMessage(JSON.stringify({ id: f.sent[0]!.id, ok: false, error: { code: "bad-input", message: "no" } }));
    expect(await p).toEqual({ ok: false, error: { code: "bad-input", message: "no" } });
  });

  it("times out a hung job, reloads, and runs the next one after ready", async () => {
    const f = fake();
    f.ready();
    const a = f.client.run(pdfJob);
    const b = f.client.run(pdfJob);
    vi.advanceTimersByTime(1001);
    expect(await a).toMatchObject({ ok: false, error: { code: "timeout" } });
    expect(f.reloads()).toBe(1);
    expect(f.sent).toHaveLength(1);
    f.ready();
    expect(f.sent).toHaveLength(2);
    f.answer(f.sent[1]!.id, 1);
    expect(await b).toEqual({ ok: true, value: 1 });
  });

  it("reloads after the WebView is terminated and retries the job once", async () => {
    const f = fake();
    f.ready();
    const p = f.client.run(pdfJob);
    f.client.handleTerminated();
    expect(f.reloads()).toBe(1);
    f.ready();
    expect(f.sent).toHaveLength(2);
    f.answer(f.sent[1]!.id, "ok");
    expect(await p).toEqual({ ok: true, value: "ok" });
  });

  it("gives up with 'terminated' when the retry is terminated too", async () => {
    const f = fake();
    f.ready();
    const p = f.client.run(pdfJob);
    f.client.handleTerminated();
    f.ready();
    f.client.handleTerminated();
    expect(await p).toMatchObject({ ok: false, error: { code: "terminated" } });
  });

  it("ignores a late answer for a job already given up on", async () => {
    const f = fake();
    f.ready();
    const a = f.client.run(pdfJob);
    vi.advanceTimersByTime(1001);
    await a;
    f.ready();
    f.answer(f.sent[0]!.id, "late");
    const b = f.client.run(pdfJob);
    f.answer(f.sent[1]!.id, "fresh");
    expect(await b).toEqual({ ok: true, value: "fresh" });
  });

  it("rejects oversize input before sending", async () => {
    const f = fake();
    f.ready();
    const r = await f.client.run({ type: "transcriptPdf", pdfBase64: "A".repeat(LIMITS.maxPdfBase64 + 1) });
    expect(r).toMatchObject({ ok: false, error: { code: "too-large" } });
    expect(f.sent).toHaveLength(0);
  });

  it("fails queued jobs as 'unavailable' when the page never becomes ready", async () => {
    const f = fake();
    const p = f.client.run(pdfJob);
    vi.advanceTimersByTime(5001); // first timeout: one reload
    expect(f.reloads()).toBe(1);
    vi.advanceTimersByTime(5001);
    expect(await p).toMatchObject({ ok: false, error: { code: "unavailable" } });
  });
});

import { describe, expect, it, vi } from "vitest";
import { readTranscript, engineErrorText, type FlowEngine } from "../src/advisor/transcript-flow";
import { applyReview, allChecked, anyChecked, buildReview } from "../src/advisor/transcript-review";
import { emailPlan, exportPlanFile, safeFileName } from "../src/advisor/export-files";
import { parseTranscriptText } from "@turboterp/app-core/transcript-parse";
import type { EngineResult } from "../src/engine/protocol";

const ok = <T,>(value: T): EngineResult<T> => ({ ok: true, value });
// Made-up lines in the Testudo shape (no real transcript).
const SAMPLE = ["Historic Course Information is listed in the order:","Fall 2024","MAJOR: COMPUTER SCIENCE COLLEGE: COMP, MATH, & NAT SCI","CMSC131 OBJECT-ORIENTED PROG I A 4.00 4.00 16.00","ENGL101 ACADEMIC WRITING B+ 3.00 3.00 9.90 FSPW","Semester: Attempted 7.00; Earned 7.00; QPoints 25.90; GPA 3.700","UG Cumulative: 7.00; 7.00; 25.90; 3.700"].join("\n");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fakeEngine(handlers: Record<string, (job: any) => EngineResult<any>>): FlowEngine & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    run: ((job: any) => {
      calls.push(job.type + (job.source ? `:${job.source}` : ""));
      return Promise.resolve(handlers[job.type]!(job));
    }) as FlowEngine["run"],
  };
}

describe("readTranscript", () => {
  it("parses pasted text without the engine", async () => {
    const engine = fakeEngine({});
    const r = await readTranscript({ kind: "paste", text: SAMPLE }, engine, () => {});
    expect(r.ok && r.source).toBe("paste");
    expect(engine.calls).toEqual([]);
  });
  it("rejects empty paste", async () => {
    const r = await readTranscript({ kind: "paste", text: "  " }, fakeEngine({}), () => {});
    expect(r.ok).toBe(false);
  });
  it("reads a text-layer PDF directly", async () => {
    const engine = fakeEngine({ transcriptPdf: () => ok({ text: SAMPLE, hasTextLayer: true, pageCount: 1 }) });
    const r = await readTranscript({ kind: "pdf", base64: "AAA" }, engine, () => {});
    expect(r.ok && r.source).toBe("pdf");
    expect(engine.calls).toEqual(["transcriptPdf"]);
  });
  it("falls back to OCR for a scanned PDF and says so", async () => {
    const engine = fakeEngine({
      transcriptPdf: () => ok({ text: "", hasTextLayer: false, pageCount: 2 }),
      transcriptOcr: () => ok({ text: SAMPLE, pageCount: 2 }),
    });
    const progress: string[] = [];
    const r = await readTranscript({ kind: "pdf", base64: "AAA" }, engine, (d) => progress.push(d));
    expect(r.ok && r.source).toBe("ocr");
    expect(engine.calls).toEqual(["transcriptPdf", "transcriptOcr:pdf"]);
    expect(progress.some((p) => /OCR/.test(p))).toBe(true);
  });
  it("OCRs each photo and joins the text", async () => {
    const engine = fakeEngine({ transcriptOcr: () => ok({ text: SAMPLE, pageCount: 1 }) });
    const r = await readTranscript({ kind: "images", base64s: ["a", "b"] }, engine, () => {});
    expect(r.ok && r.source).toBe("ocr");
    expect(engine.calls).toEqual(["transcriptOcr:image", "transcriptOcr:image"]);
  });
  it("turns engine errors into plain text", async () => {
    for (const code of ["too-large", "timeout", "bad-input"] as const) {
      const engine = fakeEngine({ transcriptPdf: () => ({ ok: false, error: { code, message: "x" } }) });
      const r = await readTranscript({ kind: "pdf", base64: "A" }, engine, () => {});
      expect(r).toEqual({ ok: false, message: engineErrorText({ code, message: "x" }) });
    }
    expect(engineErrorText({ code: "too-large", message: "" })).toMatch(/too large/);
    expect(engineErrorText({ code: "timeout", message: "" })).toMatch(/too long/);
  });
  it("drops the result when cancelled", async () => {
    const token = { cancelled: false };
    const engine = fakeEngine({
      transcriptPdf: () => {
        token.cancelled = true;
        return ok({ text: SAMPLE, hasTextLayer: true, pageCount: 1 });
      },
    });
    const r = await readTranscript({ kind: "pdf", base64: "A" }, engine, () => {}, token);
    expect(r).toMatchObject({ ok: false, cancelled: true });
  });
  it("reports a file with no readable text", async () => {
    const engine = fakeEngine({ transcriptPdf: () => ok({ text: " ", hasTextLayer: true, pageCount: 1 }) });
    const r = await readTranscript({ kind: "pdf", base64: "A" }, engine, () => {});
    expect(r.ok).toBe(false);
  });
});

describe("review and apply", () => {
  it("starts all checked and applies only checked rows", () => {
    const review = buildReview(parseTranscriptText(SAMPLE, "paste"));
    expect(review.parsed.courses.length).toBeGreaterThan(0);
    const checks = allChecked(review);
    expect(anyChecked(review, checks)).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plan = { terms: [], programs: [], prior: { ap: [], ib: [], dual: [], choices: {} } } as any;
    const none = { ...checks, courses: checks.courses.map(() => false), gpa: false };
    expect(anyChecked(review, none)).toBe(false);
    const all = applyReview(plan, review, checks);
    const some = applyReview(plan, review, none);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const count = (p: any) => p.terms.reduce((n: number, t: any) => n + t.courses.length, 0);
    expect(count(all)).toBe(review.parsed.courses.length);
    expect(count(some)).toBe(0);
  });
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PLAN = { header: {}, terms: [] } as any;
const file = { base64: "QUJD", mime: "application/pdf", fileName: "TurboTerp 4-year plan.pdf" };

describe("exportPlanFile", () => {
  it("renders, writes to cache, shares", async () => {
    const engine = fakeEngine({ exportPdf: () => ok(file), exportXlsx: () => ok({ ...file, mime: "x", fileName: "p.xlsx" }) });
    const writeBase64 = vi.fn().mockResolvedValue("file:///cache/a.pdf");
    const share = vi.fn().mockResolvedValue(undefined);
    expect(await exportPlanFile("pdf", PLAN, engine, { writeBase64, share })).toEqual({ ok: true });
    expect(writeBase64).toHaveBeenCalledWith("TurboTerp_4-year_plan.pdf", "QUJD");
    expect(share).toHaveBeenCalledWith("file:///cache/a.pdf", "application/pdf", "TurboTerp_4-year_plan.pdf");
    await exportPlanFile("xlsx", PLAN, engine, { writeBase64, share });
    expect(engine.calls).toEqual(["exportPdf", "exportXlsx"]);
  });
  it("reports engine and share failures", async () => {
    const bad = fakeEngine({ exportPdf: () => ({ ok: false, error: { code: "timeout", message: "" } }) });
    const deps = { writeBase64: vi.fn(), share: vi.fn() };
    expect((await exportPlanFile("pdf", PLAN, bad, deps)).ok).toBe(false);
    expect(deps.share).not.toHaveBeenCalled();
    const good = fakeEngine({ exportPdf: () => ok(file) });
    const r = await exportPlanFile("pdf", PLAN, good, {
      writeBase64: async () => "u",
      share: async () => {
        throw new Error("no");
      },
    });
    expect(r.ok).toBe(false);
  });
  it("keeps file names to one safe segment", () => {
    expect(safeFileName("../../etc/passwd")).not.toContain("/");
    expect(safeFileName("..")).toBe("plan");
  });
});

describe("emailPlan", () => {
  const engine = () => fakeEngine({ exportPdf: () => ok(file) });
  it("needs a signed-in token", async () => {
    const post = vi.fn();
    const r = await emailPlan(PLAN, ["a"], engine(), { getToken: async () => null, post });
    expect(r).toMatchObject({ ok: false, needsSignIn: true });
    expect(post).not.toHaveBeenCalled();
  });
  it("posts the pdf and summary with the token", async () => {
    const post = vi.fn().mockResolvedValue({ status: 200, body: { email: "a@b.c" } });
    const r = await emailPlan(PLAN, ["a"], engine(), { getToken: async () => "tok", post });
    expect(r).toEqual({ ok: true, email: "a@b.c" });
    expect(post).toHaveBeenCalledWith({ pdfBase64: "QUJD", summary: ["a"] }, "tok");
  });
  it("maps statuses and network errors", async () => {
    const mk = (status: number, error?: string) => emailPlan(PLAN, [], engine(), { getToken: async () => "t", post: async () => ({ status, body: { error } }) });
    expect(await mk(429)).toMatchObject({ ok: false, message: expect.stringMatching(/5 times/) });
    expect(await mk(401)).toMatchObject({ needsSignIn: true });
    expect(await mk(503, "not-configured")).toMatchObject({ message: "Emailing isn't available yet." });
    const r = await emailPlan(PLAN, [], engine(), {
      getToken: async () => "t",
      post: async () => {
        throw new Error("net");
      },
    });
    expect(r.ok).toBe(false);
  });
});

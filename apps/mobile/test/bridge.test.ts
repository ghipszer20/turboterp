// The production engine page answers typed jobs in a real browser context (headless Microsoft Edge
// over the DevTools protocol, like apps/web/scripts/ui-check.mjs): audit, PDF text, OCR, both exports.
// Skipped when Edge isn't installed.
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import type { PlanExport } from "@turboterp/app-core/export/plan-export";
import { computePriorCredit } from "@turboterp/app-core/prior-credit";
import { seedFromUrl } from "@turboterp/app-core/seed";
import { buildCatalog } from "@turboterp/plan/catalog";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const root = resolve(__dirname, "..");
const PORT = 9447;

function makePdf(text: string): string {
  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 100] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${`BT /F1 18 Tf 20 50 Td (${text}) Tj ET`.length} >>\nstream\nBT /F1 18 Tf 20 50 Td (${text}) Tj ET\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objs.forEach((o, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (const o of offsets) pdf += `${String(o).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, "latin1").toString("base64");
}

const planExport: PlanExport = {
  header: { name: "Sam", date: "2026-09-29", disclaimer: "Unofficial", gradesHidden: false },
  programsLabel: "Computer Science",
  catalogYear: "2026–27",
  creditsPlanned: 4,
  priorCreditCredits: 0,
  terms: [{ name: "Fall 2026", credits: 4, courses: [{ id: "CMSC131", title: "OOP I", credits: 4, grade: "A", category: "major" }] }],
};

describe.skipIf(!existsSync(EDGE))("engine bridge in a browser context", () => {
  let server: ReturnType<typeof createServer>;
  let edge: ReturnType<typeof spawn>;
  let ws: WebSocket;
  let nextId = 1;
  const pending = new Map<number, (v: any) => void>();

  const cdp = (method: string, params: object = {}) =>
    new Promise<any>((res) => {
      const id = nextId++;
      pending.set(id, res);
      ws.send(JSON.stringify({ id, method, params }));
    });
  const evalValue = async (expression: string) => (await cdp("Runtime.evaluate", { expression, returnByValue: true })).result.result.value;

  /** Posts a job into the page and waits for the bridge's reply (captured via a fake ReactNativeWebView). */
  async function ask(id: number, job: object, timeoutMs = 120_000): Promise<any> {
    const expr = `new Promise((resolve) => {
      window.ReactNativeWebView = { postMessage: (s) => { const m = JSON.parse(s); if (m.id === ${id}) resolve(m); } };
      window.postMessage(${JSON.stringify(JSON.stringify({ id, job }))}, "*");
    })`;
    const r = await Promise.race([
      cdp("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }),
      new Promise((_, rej) => setTimeout(() => rej(new Error("bridge timeout")), timeoutMs)),
    ]);
    return r.result.result.value;
  }

  beforeAll(async () => {
    execFileSync("node", [join(root, "scripts/build-bridge.mjs")], { stdio: "pipe" });
    const page = readFileSync(join(root, "dist-bridge", "index.html"));
    server = createServer((_req, res) => {
      res.setHeader("content-type", "text/html");
      res.end(page);
    });
    await new Promise<void>((r) => server.listen(0, r));
    const url = `http://127.0.0.1:${(server.address() as { port: number }).port}/`;
    edge = spawn(
      EDGE,
      ["--headless=new", "--disable-gpu", `--remote-debugging-port=${PORT}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "bridge-edge-"))}`, url],
      { stdio: "ignore" },
    );
    let wsUrl = "";
    for (let i = 0; i < 60 && !wsUrl; i++) {
      await new Promise((r) => setTimeout(r, 500));
      try {
        const list = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()) as any[];
        wsUrl = list.find((t) => t.type === "page" && t.url.startsWith("http://127.0.0.1"))?.webSocketDebuggerUrl ?? "";
      } catch {
        /* edge still starting */
      }
    }
    ws = new WebSocket(wsUrl);
    await new Promise((r) => (ws.onopen = r));
    ws.onmessage = (e) => {
      const m = JSON.parse(String(e.data));
      pending.get(m.id)?.(m);
      pending.delete(m.id);
    };
    await new Promise((r) => setTimeout(r, 1000));
  }, 120_000);

  afterAll(() => {
    ws?.close();
    if (edge?.pid)
      try {
        execFileSync("taskkill", ["/PID", String(edge.pid), "/T", "/F"], { stdio: "ignore" });
      } catch {
        /* gone */
      }
    server?.close();
  });

  it("runs the real audit (highs wasm inlined) for the owner plan and times the first audit", async () => {
    const courses = JSON.parse(readFileSync(join(root, "../../packages/plan/test/fixtures/courses-202701.json"), "utf8")).courses;
    const catalog = buildCatalog(courses);
    const plan = seedFromUrl("?seed=owner", { NODE_ENV: "development" })!.plan!;
    const priorCourses = computePriorCredit(plan.prior, (id) => catalog.get(id)?.genEd ?? []).courses;
    const t = performance.now();
    const reply = await ask(1, { type: "audit", input: { plan, catalog: [...catalog.entries()], priorCourses } });
    console.log(`first audit in bridge: ${Math.round(performance.now() - t)} ms`);
    expect(reply.ok, JSON.stringify(reply.error)).toBe(true);
    expect(reply.result.audits.length).toBeGreaterThan(0);
    expect(reply.result.degrees.mode).toBe("double-major");
  }, 180_000);

  it("extracts transcript PDF text with pdfjs", async () => {
    const reply = await ask(2, { type: "transcriptPdf", pdfBase64: makePdf("Hello TurboTerp transcript") });
    expect(reply.ok, JSON.stringify(reply.error)).toBe(true);
    expect(reply.result.text).toContain("Hello TurboTerp transcript");
    expect(reply.result.pageCount).toBe(1);
  }, 90_000);

  it("reads text from an image with the bundled tesseract", async () => {
    const png = await evalValue(`(() => { const c = document.createElement("canvas"); c.width = 700; c.height = 140; const x = c.getContext("2d");
      x.fillStyle = "white"; x.fillRect(0, 0, 700, 140); x.fillStyle = "black"; x.font = "bold 56px Arial"; x.fillText("CMSC131 Grade A", 20, 90);
      return c.toDataURL("image/png").split(",")[1]; })()`);
    const t = performance.now();
    const reply = await ask(3, { type: "transcriptOcr", source: "image", dataBase64: png }, 200_000);
    console.log(`ocr in bridge: ${Math.round(performance.now() - t)} ms`);
    expect(reply.ok, JSON.stringify(reply.error)).toBe(true);
    expect(reply.result.text).toMatch(/CMSC\s?131/);
  }, 220_000);

  it("rejects an image over the pixel cap", async () => {
    const png = await evalValue(`(() => { const c = document.createElement("canvas"); c.width = 6000; c.height = 4500; return c.toDataURL("image/png").split(",")[1]; })()`);
    const reply = await ask(4, { type: "transcriptOcr", source: "image", dataBase64: png });
    expect(reply.ok).toBe(false);
    expect(reply.error.code).toBe("too-large");
  }, 90_000);

  it("exports the plan as a PDF and an XLSX", async () => {
    const pdf = await ask(5, { type: "exportPdf", plan: planExport });
    expect(pdf.ok, JSON.stringify(pdf.error)).toBe(true);
    expect(Buffer.from(pdf.result.base64, "base64").subarray(0, 5).toString()).toBe("%PDF-");
    const xlsx = await ask(6, { type: "exportXlsx", plan: planExport });
    expect(xlsx.ok, JSON.stringify(xlsx.error)).toBe(true);
    expect(Buffer.from(xlsx.result.base64, "base64").subarray(0, 2).toString()).toBe("PK");
  }, 120_000);

  it("fetches nothing but the page itself", async () => {
    const urls = await evalValue(
      `performance.getEntriesByType("resource").map((e) => e.name).filter((n) => !n.startsWith("blob:") && !n.startsWith("data:"))`,
    );
    expect(urls).toEqual([]);
  });
});

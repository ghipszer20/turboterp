// Spike cases (b) and (c): the engine bridge page answers postMessage requests in a real browser
// context (headless Microsoft Edge over the DevTools protocol, like apps/web/scripts/ui-check.mjs).
// Skipped when Edge isn't installed.
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
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

  /** Posts a request into the page and waits for the bridge's reply (captured via a fake ReactNativeWebView). */
  async function ask(req: object, timeoutMs = 60_000): Promise<any> {
    const expr = `new Promise((resolve) => {
      window.ReactNativeWebView = { postMessage: (s) => { const m = JSON.parse(s); if (m.id === ${(req as any).id}) resolve(m); } };
      window.postMessage(${JSON.stringify(JSON.stringify(req))}, "*");
    })`;
    const r = await Promise.race([
      cdp("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }),
      new Promise((_, rej) => setTimeout(() => rej(new Error("bridge timeout")), timeoutMs)),
    ]);
    return r.result.result.value;
  }

  beforeAll(async () => {
    execFileSync("node", [join(root, "scripts/build-bridge.mjs")], { stdio: "pipe" });
    server = createServer((req, res) => {
      const f = req.url === "/" ? "index.html" : req.url!.slice(1);
      res.setHeader("content-type", f.endsWith(".js") ? "text/javascript" : "text/html");
      try { res.end(readFileSync(join(root, "dist-bridge", f))); } catch { res.statusCode = 404; res.end(); }
    });
    await new Promise<void>((r) => server.listen(0, r));
    const url = `http://127.0.0.1:${(server.address() as { port: number }).port}/`;
    edge = spawn(EDGE, [
      "--headless=new", "--disable-gpu", `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${mkdtempSync(join(tmpdir(), "bridge-edge-"))}`, url,
    ], { stdio: "ignore" });
    let wsUrl = "";
    for (let i = 0; i < 60 && !wsUrl; i++) {
      await new Promise((r) => setTimeout(r, 500));
      try {
        const list = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()) as any[];
        wsUrl = list.find((t) => t.type === "page" && t.url.startsWith("http://127.0.0.1"))?.webSocketDebuggerUrl ?? "";
      } catch { /* edge still starting */ }
    }
    ws = new WebSocket(wsUrl);
    await new Promise((r) => (ws.onopen = r));
    ws.onmessage = (e) => {
      const m = JSON.parse(String(e.data));
      pending.get(m.id)?.(m);
      pending.delete(m.id);
    };
    await new Promise((r) => setTimeout(r, 1000));
  }, 90_000);

  afterAll(() => {
    ws?.close();
    if (edge?.pid) try { execFileSync("taskkill", ["/PID", String(edge.pid), "/T", "/F"], { stdio: "ignore" }); } catch { /* gone */ }
    server?.close();
  });

  it("(b) runs a real CS-major audit (highs wasm inlined) and answers by postMessage", async () => {
    const reply = await ask({ id: 1, type: "audit" });
    expect(reply.ok, reply.error).toBe(true);
    const statuses = Object.values(reply.result);
    expect(statuses.length).toBeGreaterThan(5);
    expect(statuses.every((s) => s === "satisfied")).toBe(true);
  }, 90_000);

  it("(c) extracts PDF text with pdfjs inside the bridge", async () => {
    const reply = await ask({ id: 2, type: "pdf-text", base64: makePdf("Hello TurboTerp transcript") });
    expect(reply.ok, reply.error).toBe(true);
    expect(reply.result).toContain("Hello TurboTerp transcript");
  }, 90_000);
});

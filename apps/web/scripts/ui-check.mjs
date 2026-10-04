// Drives headless Microsoft Edge over the DevTools protocol to check pages
// after client JavaScript has run: collects console errors and page text,
// and saves phone-sized screenshots. Windows-only helper for local checks.
//
//   node scripts/ui-check.mjs http://localhost:3000 /campus/transport /campus/dining [--dark] [--desktop] [--full]
//   --dark: prefers-color-scheme: dark   --desktop: 1280×820 instead of iPhone
//   --full: capture the whole page (the fixed tab bar then appears mid-page)
//
// Screenshots go to ./.ui-check/ (gitignored).

import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const dark = args.includes("--dark");
const desktop = args.includes("--desktop");
const full = args.includes("--full");
const [base = "http://localhost:3000", ...paths] = args.filter((a) => !a.startsWith("--"));
const suffix = `${desktop ? "-desktop" : ""}${dark ? "-dark" : ""}`;
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const PORT = 9333;
const OUT = ".ui-check";
mkdirSync(OUT, { recursive: true });

const edge = spawn(EDGE, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${join(tmpdir(), `turboterp-ui-check-${Date.now()}`)}`,
  "about:blank",
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function target() {
  for (let i = 0; i < 50; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error("Edge DevTools endpoint didn't come up");
}

const ws = new WebSocket(await target());
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pending = new Map();
const errors = [];
ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  } else if (msg.method === "Runtime.exceptionThrown") {
    errors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
  } else if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") {
    errors.push(msg.params.args.map((a) => a.value ?? a.description).join(" "));
  }
});
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const n = ++id;
    pending.set(n, resolve);
    ws.send(JSON.stringify({ id: n, method, params }));
  });

await send("Runtime.enable");
await send("Page.enable");
await send(
  "Emulation.setDeviceMetricsOverride",
  desktop
    ? { width: 1280, height: 820, deviceScaleFactor: 1, mobile: false }
    : { width: 393, height: 852, deviceScaleFactor: 2, mobile: true }, // iPhone 15-ish
);
await send("Emulation.setEmulatedMedia", {
  features: [{ name: "prefers-color-scheme", value: dark ? "dark" : "light" }],
});

for (const path of paths.length ? paths : ["/"]) {
  errors.length = 0;
  await send("Page.navigate", { url: base + path });
  await sleep(7000);
  // Optional interaction before capturing, e.g. UI_CHECK_EVAL='document.querySelector("button").click()'
  // UI_CHECK_EVAL_WAIT overrides the default 800ms settle time after it runs, e.g. for a debounced,
  // solver-backed comparison that needs longer than a click's usual repaint.
  if (process.env.UI_CHECK_EVAL) {
    await send("Runtime.evaluate", { expression: process.env.UI_CHECK_EVAL });
    await sleep(Number(process.env.UI_CHECK_EVAL_WAIT ?? 800));
  }
  const { result } = await send("Runtime.evaluate", {
    expression: "document.querySelector('main')?.innerText ?? document.body.innerText",
    returnByValue: true,
  });
  const text = String(result?.result?.value ?? "").replace(/\n+/g, " | ");
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: full });
  const name = path.replace(/\W+/g, "_").replace(/^_|_$/g, "") || "today";
  const file = join(OUT, `${name}${suffix}.png`);
  writeFileSync(file, Buffer.from(shot.result.data, "base64"));
  console.log(`\n=== ${path}  (${file})`);
  console.log(`errors: ${errors.length ? errors.join("\n  ") : "none"}`);
  console.log(`text: ${text.slice(0, Number(process.env.TEXT_LIMIT ?? 600))}`);
}

ws.close();
edge.kill();
process.exit(0);

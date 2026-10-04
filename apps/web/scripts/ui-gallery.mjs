// Screenshots every page of the app (phone light, phone dark, desktop) into <repo>/ui-review/
// with an index.html gallery, so the owner can look over the whole UI in one place.
// Needs `npm run dev` running (seed deep links only work in development) and, for real
// campus data, `npm run snapshots -w @turboterp/campus-data -- daily` first.
//
//   node scripts/ui-gallery.mjs [http://localhost:3000]
//
// Windows-only, like ui-check.mjs (headless Edge over the DevTools protocol).

import { spawn } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.argv[2] ?? "http://localhost:3000";
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const OUT = join(REPO, "ui-review");
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const PORT = 9334;
const MAX_HEIGHT = 7000;

const click = (text) =>
  `[...document.querySelectorAll('button,[role=tab],[role=radio],a,label')].find((b) => b.textContent.trim() === ${JSON.stringify(text)})?.click()`;
const COURSES = "c=CMSC131,MATH141,ENGL101,COMM107";

// [group, name, path, eval?, settle ms after eval]
const SHOTS = [
  ["Home", "Today", "/"],
  ["Home", "About", "/about"],
  ["Campus", "Campus overview", "/campus"],
  ["Campus", "Dining", "/campus/dining"],
  ["Campus", "Transport (buses, map, trip planner)", "/campus/transport"],
  ["Campus", "Libraries", "/campus/libraries"],
  ["Campus", "Study rooms", "/campus/rooms"],
  ["Campus", "Gyms", "/campus/gym"],
  ["Schedule", "Schedule builder (empty)", "/schedule"],
  ["Schedule", "Schedule gallery (4 courses)", `/schedule?${COURSES}`],
  ["Schedule", "Build my own", `/schedule?${COURSES}&view=own`],
  ["Advisor", "First visit (agreement)", "/advisor"],
  ["Advisor", "Plan (Math Applied + CS)", "/advisor?seed=owner"],
  ["Advisor", "Prior credit", "/advisor?seed=owner", click("Prior credit"), 1500],
  ["Advisor", "Audit", "/advisor?seed=owner", click("Audit"), 3000],
  ["Advisor", "What if", "/advisor?seed=owner", click("What if"), 3000],
  ["Advisor", "Export menu", "/advisor?seed=owner", `document.querySelector('[aria-haspopup=menu]')?.click()`, 1000],
  ["Advisor", "Edit setup", "/advisor?seed=owner&setup=1"],
  ["Advisor", "Program picker (blocked minor)", "/advisor?seed=owner&setup=1&q=statistics"],
  ["Advisor", "Import transcript", "/advisor?seed=owner&import=1"],
  ["Advisor", "Pre-professional tracks (audit)", "/advisor?seed=owner&tracks=pre-med,pre-law", click("Audit"), 3000],
  ["Advisor", "Double degree checks", "/advisor?seed=owner&degree=double-degree"],
  ["Advisor", "Test student: major switch", "/advisor?seed=student&id=major-switch"],
  ["Legal", "Terms of Use", "/terms"],
  ["Legal", "Privacy", "/privacy"],
];
const VIEWS = [
  { key: "phone", label: "Phone", width: 393, height: 852, scale: 2, mobile: true, dark: false },
  { key: "phone-dark", label: "Phone, dark", width: 393, height: 852, scale: 2, mobile: true, dark: true },
  { key: "desktop", label: "Desktop", width: 1280, height: 820, scale: 1, mobile: false, dark: false },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, "pages"), { recursive: true });

const edge = spawn(EDGE, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${join(tmpdir(), `turboterp-ui-gallery-${Date.now()}`)}`,
  "about:blank",
]);

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
  }
});
const send = (method, params = {}) =>
  new Promise((done) => {
    const n = ++id;
    pending.set(n, done);
    ws.send(JSON.stringify({ id: n, method, params }));
  });
const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true })).result?.result?.value;

await send("Runtime.enable");
await send("Page.enable");

const problems = [];
for (const view of VIEWS) {
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: view.dark ? "dark" : "light" }] });
  for (const [group, name, path, action, settle] of SHOTS) {
    const metrics = { width: view.width, height: view.height, deviceScaleFactor: view.scale, mobile: view.mobile };
    await send("Emulation.setDeviceMetricsOverride", metrics);
    // A fresh page each time, so one shot's localStorage (seeded plans, schedules) never leaks into the next.
    await send("Page.navigate", { url: "about:blank" });
    await evaluate("try { localStorage.clear(); sessionStorage.clear(); } catch {}");
    errors.length = 0;
    await send("Page.navigate", { url: BASE + path });
    await sleep(6000);
    if (action) {
      await evaluate(action);
      await sleep(settle ?? 1000);
    }
    // Grow the viewport to the page's full height, so fixed bars stay at the bottom.
    const height = await evaluate("Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)");
    if (height > view.height) {
      await send("Emulation.setDeviceMetricsOverride", { ...metrics, height: Math.min(height, MAX_HEIGHT) });
      await sleep(800);
    }
    const shot = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(join(OUT, "pages", `${slug(group)}--${slug(name)}--${view.key}.png`), Buffer.from(shot.result.data, "base64"));
    if (errors.length) problems.push(`${view.key} ${path}: ${errors[0].split("\n")[0]}`);
    console.log(`${view.key.padEnd(10)} ${group} / ${name}${errors.length ? "  (page error)" : ""}`);
  }
}
ws.close();
edge.kill();

// Earlier feature close-ups (docs/screenshots/<feature>/) that show states a clean page can't,
// e.g. the leave-by card, which needs a saved schedule.
const featureDir = join(REPO, "docs", "screenshots");
const features = existsSync(featureDir) ? readdirSync(featureDir) : [];
for (const f of features) cpSync(join(featureDir, f), join(OUT, "feature-closeups", f), { recursive: true });

const groups = [...new Set(SHOTS.map((s) => s[0]))];
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const img = (file, label) => `<figure><a href="${file}" target="_blank"><img loading="lazy" src="${file}" alt="${esc(label)}"></a><figcaption>${esc(label)}</figcaption></figure>`;
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>TurboTerp UI review</title>
<style>
:root{--bg:#f5f5f7;--card:#fff;--text:#1d1d1f;--muted:#6e6e73;--accent:#BA0C2F}
@media (prefers-color-scheme:dark){:root{--bg:#000;--card:#1c1c1e;--text:#f5f5f7;--muted:#98989d;--accent:#ff4d6d}}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.45 -apple-system,"Segoe UI",system-ui,sans-serif}
header{padding:24px 16px 8px;max-width:1500px;margin:auto}h1{margin:0;font-size:28px}header p{color:var(--muted);margin:4px 0 0}
nav{position:sticky;top:0;background:var(--bg);padding:8px 16px;z-index:1;max-width:1500px;margin:auto;display:flex;gap:8px;flex-wrap:wrap}
nav a{color:var(--accent);text-decoration:none;font-weight:600;padding:4px 10px;border-radius:99px;background:var(--card)}
main{max-width:1500px;margin:auto;padding:0 16px 48px}h2{margin:32px 0 8px;font-size:22px}
section.shot{background:var(--card);border-radius:14px;padding:14px;margin:12px 0}h3{margin:0 0 10px;font-size:16px}h3 code{color:var(--muted);font-weight:400;font-size:13px}
.row{display:flex;gap:14px;align-items:flex-start;overflow-x:auto}
figure{margin:0;flex:0 0 auto}figure img{display:block;max-height:560px;border-radius:8px;border:1px solid #8883}
figure:nth-child(-n+2) img{width:200px;max-height:none;height:auto;object-fit:cover;object-position:top}
figure:nth-child(3) img{width:640px;max-height:none}figcaption{color:var(--muted);font-size:13px;margin-top:4px}
.closeups{display:flex;gap:14px;flex-wrap:wrap}.closeups img{width:300px}
</style></head><body>
<header><h1>TurboTerp UI review</h1><p>Captured ${new Date().toLocaleString("en-US")} from ${esc(BASE)}. Click any image for full size. Files are in <code>pages/</code>.</p></header>
<nav>${groups.map((g) => `<a href="#${slug(g)}">${esc(g)}</a>`).join("")}${features.length ? `<a href="#closeups">Feature close-ups</a>` : ""}</nav>
<main>
${groups
  .map(
    (g) => `<h2 id="${slug(g)}">${esc(g)}</h2>
${SHOTS.filter((s) => s[0] === g)
  .map(([, name, path]) => `<section class="shot"><h3>${esc(name)} <code>${esc(path)}</code></h3><div class="row">${VIEWS.map((v) => img(`pages/${slug(g)}--${slug(name)}--${v.key}.png`, v.label)).join("")}</div></section>`)
  .join("\n")}`,
  )
  .join("\n")}
${
  features.length
    ? `<h2 id="closeups">Feature close-ups</h2><p style="color:var(--muted)">Earlier screenshots from each feature branch; they show states a clean page can't (e.g. the leave-by card needs a saved schedule). Some predate later polish.</p>` +
      features
        .map((f) => `<section class="shot"><h3>${esc(f)}</h3><div class="closeups">${readdirSync(join(featureDir, f)).map((p) => img(`feature-closeups/${f}/${p}`, p)).join("")}</div></section>`)
        .join("\n")
    : ""
}
</main></body></html>`;
writeFileSync(join(OUT, "index.html"), html);
console.log(`\n${SHOTS.length * VIEWS.length} screenshots → ${join(OUT, "index.html")}`);
if (problems.length) console.log(`page errors:\n  ${problems.join("\n  ")}`);
process.exit(0);

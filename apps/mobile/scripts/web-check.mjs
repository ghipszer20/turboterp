// Screenshots app screens from the Expo web export, with the web app's ui-check script
// (headless Edge, Windows). Exports the app, serves dist/ on a local port, runs ui-check, stops.
//
//   node scripts/web-check.mjs /campus /schedule [--dark] [--skip-export]
//
// Paths default to "/". Screenshots go to ./.ui-check/. Other flags pass through to ui-check.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const args = process.argv.slice(2);
const skipExport = args.includes("--skip-export");
const rest = args.filter((a) => a !== "--skip-export");
const paths = rest.filter((a) => !a.startsWith("--"));
const flags = rest.filter((a) => a.startsWith("--"));
const PORT = 8099;

if (!skipExport) {
  const r = spawnSync("npx", ["expo", "export", "--platform", "web"], { cwd: root, stdio: "inherit", shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".ttf": "font/ttf", ".ico": "image/x-icon" };
const server = createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? "/").split("?")[0]);
  let file = normalize(join(dist, url));
  if (!file.startsWith(dist)) file = join(dist, "index.html");
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(dist, "index.html"); // single-page output
  res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise((ok) => server.listen(PORT, ok));
const check = resolve(root, "../web/scripts/ui-check.mjs");
const r = spawnSync("node", [check, `http://localhost:${PORT}`, ...(paths.length ? paths : ["/"]), ...flags], { cwd: root, stdio: "inherit" });
server.close();
process.exit(r.status ?? 0);

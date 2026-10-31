// Builds the engine bridge: ONE self-contained HTML file (assets/engine/engine.html, the app asset;
// gitignored, rebuilt by `npm run build:bridge`) with the script, the highs WASM, tesseract's worker,
// core and English data, and the pdfjs worker all inlined. Also writes dist-bridge/index.html
// (the same file) for the browser test.
import { build } from "esbuild";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const highsDir = dirname(dirname(require.resolve("highs")));
const tessWorker = require.resolve("tesseract.js/dist/worker.min.js");
const tessCore = require.resolve("tesseract.js-core/tesseract-core-lstm.wasm.js");
const tessEng = join(dirname(require.resolve("@tesseract.js-data/eng/package.json")), "4.0.0_best_int", "eng.traineddata.gz");

const ALIASES = {
  highs: join(highsDir, "build/highs.mjs"),
  "highs-wasm": join(highsDir, "build/highs.wasm"),
  "tess-worker": tessWorker,
  "tess-core": tessCore,
  "tess-eng": tessEng,
};

const result = await build({
  entryPoints: [resolve(root, "bridge/entry.ts")],
  write: false,
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "es2020",
  minify: true,
  define: { "import.meta.url": JSON.stringify("https://bridge.invalid/bridge.js") },
  // jspdf's optional html() dependencies are never used by the plan export.
  external: ["canvg", "html2canvas", "dompurify"],
  logLevel: "warning",
  plugins: [
    {
      name: "bridge-aliases",
      setup(b) {
        b.onResolve({ filter: /^highs$/ }, (a) => ({ path: ALIASES[a.path] }));
        // Files embedded as bytes or text, so nothing is fetched at run time.
        b.onResolve({ filter: /^(highs-wasm|tess-worker|tess-core|tess-eng)$/ }, (a) => ({ path: ALIASES[a.path], namespace: "embed" }));
        b.onLoad({ filter: /.*/, namespace: "embed" }, (a) => ({
          contents: readFileSync(a.path),
          loader: a.path.endsWith(".js") ? "text" : "binary",
        }));
        b.onResolve({ filter: /^node:/ }, (a) => ({ path: a.path, namespace: "empty" }));
        b.onLoad({ filter: /.*/, namespace: "empty" }, () => ({ contents: "module.exports = {};", loader: "js" }));
      },
    },
  ],
});

const js = result.outputFiles[0].text.replaceAll("</script", "<\\/script");
const html = `<!doctype html><meta charset="utf-8"><title>engine</title><script>${js}</script>`;
for (const dir of [resolve(root, "assets/engine"), resolve(root, "dist-bridge")]) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, dir.endsWith("engine") ? "engine.html" : "index.html"), html, "utf8");
}
console.log(`engine page built: ${(Buffer.byteLength(html) / 1e6).toFixed(2)} MB`);

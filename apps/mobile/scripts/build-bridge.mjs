// Builds the engine bridge page (dist-bridge/index.html + bridge.js) with esbuild.
// `highs` is aliased to bridge/highs-inline.ts so the wasm ships inside the bundle.
import { build } from "esbuild";
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "dist-bridge");
const highsDir = dirname(dirname(createRequire(import.meta.url).resolve("highs")));
mkdirSync(out, { recursive: true });

const result = await build({
  entryPoints: [resolve(root, "bridge/entry.ts")],
  outfile: resolve(out, "bridge.js"),
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "es2020",
  minify: true,
  loader: { ".wasm": "binary" },
  define: { "import.meta.url": JSON.stringify("https://bridge.invalid/bridge.js") },
  logLevel: "warning",
  metafile: true,
  plugins: [
    {
      name: "highs-inline",
      setup(b) {
        b.onResolve({ filter: /^highs$/ }, () => ({ path: resolve(root, "bridge/highs-inline.ts") }));
        // highs.mjs probes Node via `require`; in a browser those branches are dead, so mark them external-free.
        b.onResolve({ filter: /^highs-real-js$/ }, () => ({ path: resolve(highsDir, "build/highs.mjs") }));
        b.onResolve({ filter: /^highs-wasm$/ }, () => ({ path: resolve(highsDir, "build/highs.wasm") }));
        b.onResolve({ filter: /^node:/ }, (a) => ({ path: a.path, namespace: "empty" }));
        b.onLoad({ filter: /.*/, namespace: "empty" }, () => ({ contents: "module.exports = {};", loader: "js" }));
      },
    },
  ],
});
writeFileSync(
  resolve(out, "index.html"),
  '<!doctype html><meta charset="utf-8"><title>bridge</title><script src="bridge.js"></script>',
);
const bytes = Object.values(result.metafile.outputs)[0].bytes;
console.log(`bridge built: ${(bytes / 1e6).toFixed(2)} MB`);

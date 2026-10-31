// Spike case (d): no Node-only module is reachable from what the app (or the engine bridge) imports.
// Bundles each entry with esbuild and records every import specifier. A file may not import
// cheerio, @napi-rs/*, node:* or a bare Node builtin (fs, path, ...), except inside the packages in
// ALLOWED, whose Node branches are guarded by environment checks and dead in a phone/browser
// (highs: Emscripten glue; pdfjs-dist: optional Node canvas path).
import { build } from "esbuild";
import { builtinModules } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ENTRIES = ["app/_layout.tsx", "app/index.tsx", "bridge/entry.ts"];
const ALLOWED = ["/node_modules/highs/", "/node_modules/pdfjs-dist/"];
const builtins = new Set(builtinModules.filter((m) => !m.startsWith("_")));
const BANNED_PACKAGES = ["cheerio", "@napi-rs/canvas", "@napi-rs"];

export function isBanned(spec) {
  if (spec.startsWith("node:")) return true;
  const head = spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0];
  return builtins.has(head) || BANNED_PACKAGES.some((p) => spec === p || spec.startsWith(`${p}/`));
}

export async function findViolations() {
  const violations = [];
  const reachable = new Set();
  for (const entry of ENTRIES) {
    const result = await build({
      entryPoints: [resolve(root, entry)],
      bundle: true,
      write: false,
      metafile: true,
      platform: "browser",
      format: "esm",
      logLevel: "silent",
      loader: { ".wasm": "empty", ".png": "empty", ".ttf": "empty" },
      // The app side imports react-native etc. through Metro, not esbuild: treat non-workspace packages as leaves,
      // except the ones we want to walk (highs, pdfjs-dist).
      external: ["react", "react-native", "expo-*", "react-native-*", "react-dom"],
      plugins: [
        {
          name: "record-node-only",
          setup(b) {
            // Record Node-only imports instead of failing on them.
            b.onResolve({ filter: /.*/ }, (a) => {
              if (a.kind === "entry-point" || !isBanned(a.path)) return undefined;
              const importer = a.importer.replaceAll("\\", "/");
              if (!ALLOWED.some((p) => importer.includes(p))) violations.push(`${entry}: ${importer.replace(/.*\/(apps|packages|node_modules)\//, "$1/")} imports "${a.path}"`);
              return { path: a.path, namespace: "empty" };
            });
            b.onLoad({ filter: /.*/, namespace: "empty" }, () => ({ contents: "module.exports = {};", loader: "js" }));
          },
        },
      ],
    });
    for (const f of Object.keys(result.metafile.inputs)) reachable.add(f.replaceAll("\\", "/"));
  }
  for (const f of reachable) {
    if (/(^|\/)packages\/catalog\//.test(f) || /node_modules\/(cheerio|@napi-rs)\//.test(f)) violations.push(`reachable: ${f}`);
  }
  return { violations: [...new Set(violations)], files: reachable.size };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { violations, files } = await findViolations();
  if (violations.length) {
    console.error(`Node-only imports reachable from the app (${files} files scanned):\n${violations.join("\n")}`);
    process.exit(1);
  }
  console.log(`import graph clean (${files} files scanned)`);
}

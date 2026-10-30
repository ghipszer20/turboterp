// pdfjs-dist needs its worker script (pdf.worker.min.mjs) at a URL the browser can fetch; Next's
// bundler only sees it if referenced through `new URL(..., import.meta.url)`, which is one more
// thing that can silently break across pdfjs-dist upgrades. Following the same fix already used
// for tesseract.js's OCR assets (copy-tesseract-assets.mjs): copy it here, unhashed, and reference it by a fixed same-origin path
// (/vendor/pdfjs/pdf.worker.min.mjs) instead.
//
// Runs as apps/web's "postinstall". public/vendor/ is gitignored (build output, not source).

import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const outDir = join(import.meta.dirname, "..", "public", "vendor", "pdfjs");
mkdirSync(outDir, { recursive: true });

const src = require.resolve("pdfjs-dist/build/pdf.worker.min.mjs");
if (existsSync(src)) {
  copyFileSync(src, join(outDir, "pdf.worker.min.mjs"));
  console.log(`Copied pdfjs-dist's worker to ${outDir}`);
} else {
  console.warn(`Skipped pdf.worker.min.mjs: ${src} not found (pdfjs-dist not installed?)`);
}

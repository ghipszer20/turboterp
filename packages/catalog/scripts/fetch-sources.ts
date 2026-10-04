// Builds program-sources/<program>.md and program-sources/missing.md from the
// cached catalog pages plus each program's department/sample-plan sources
// (program-sources/sources.json).
//
//   node scripts/fetch-sources.ts --seed                    # (re)build sources.json from the catalog cache
//   node scripts/fetch-sources.ts [--catalog-cache <dir>]   # fetch each source and write the .md files
//
// Catalog pages are read only from the cache (never re-fetched); department and
// sample-plan pages are fetched politely (one at a time, 500 ms apart) and
// cached under .cache/sources/ (git-ignored). The catalog cache itself is
// git-ignored and only checked out in the main checkout, so its directory is
// overridable: --catalog-cache <dir>, or the CATALOG_CACHE_DIR env var.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createCanvas, type SKRSContext2D } from "@napi-rs/canvas";
import { fetchBytes, fetchText } from "@turboterp/campus-data/http";
import { PROGRAM_INDEX_URL, parseProgramIndex } from "../src/programs-index.ts";
import {
  buildMissingReport,
  deriveProgramKeys,
  extractSection,
  hasGeneratedHeader,
  mergeSourceMap,
  renderProgramDoc,
  seedProgramLinks,
  type MissingEntry,
  type PageContent,
  type SourcesMap,
} from "./program-sources.ts";

const args = process.argv.slice(2);
const SEED = args.includes("--seed");
const flagIdx = args.indexOf("--catalog-cache");
const CATALOG_CACHE_DIR = (
  flagIdx >= 0 ? args[flagIdx + 1]! : (process.env.CATALOG_CACHE_DIR ?? fileURLToPath(new URL("../.cache/catalog/", import.meta.url)))
)
  .replace(/\\/g, "/")
  .replace(/\/+$/, "");

const ROOT = new URL("../../../", import.meta.url); // repo root, from packages/catalog/scripts/
const SOURCES_JSON = new URL("program-sources/sources.json", ROOT);
const SOURCES_DIR = new URL("program-sources/", ROOT);
const RAW_CACHE = new URL("../.cache/sources/", import.meta.url); // packages/catalog/.cache/sources/
const PAUSE_MS = 500;
mkdirSync(RAW_CACHE, { recursive: true });
mkdirSync(SOURCES_DIR, { recursive: true });

// Matches coverage.ts's cacheFile exactly, so the two scripts agree on where a
// catalog page landed.
const catalogCacheFile = (url: string) => {
  const slug = new URL(url).pathname.replace(/^\/+|\/+$/g, "").replace(/[^A-Za-z0-9-]+/g, "_") || "root";
  return `${CATALOG_CACHE_DIR}/${slug}.html`;
};

function readCatalogPage(url: string): string | null {
  const file = catalogCacheFile(url);
  return existsSync(file) ? readFileSync(file, "utf8") : null;
}

// --- raw source cache (department/sample-plan pages) -------------------------

/** A Google Drive direct download (`drive.google.com/uc?export=download&id=...`) serves the file itself; the ARHU academic plans are PDFs shared this way. */
const isDriveDownload = (url: string) => new URL(url).hostname === "drive.google.com" && new URL(url).pathname === "/uc";
const isPdf = (url: string) => /\.pdf($|\?)/i.test(new URL(url).pathname) || isDriveDownload(url);
const isUnconvertibleDoc = (url: string) => /\.(docx?|xlsx?|csv|pptx?)($|\?)/i.test(new URL(url).pathname);
function isGoogleDoc(url: string): boolean {
  if (isDriveDownload(url)) return false;
  const host = new URL(url).hostname.toLowerCase();
  return host === "docs.google.com" || host === "drive.google.com" || host === "sheets.google.com" || host.endsWith(".google.com");
}

function rawCacheFile(url: string): URL {
  const u = new URL(url);
  const slug = `${u.hostname}${u.pathname}${isDriveDownload(url) ? `_${u.searchParams.get("id")}` : ""}`.replace(/^\/+|\/+$/g, "").replace(/\.pdf$/i, "").replace(/[^A-Za-z0-9-]+/g, "_") || "root";
  return new URL(`${slug}.${isPdf(url) ? "pdf" : "html"}`, RAW_CACHE);
}

let lastFetchAt = 0;
async function paced<T>(fn: () => Promise<T>): Promise<T> {
  const wait = PAUSE_MS - (Date.now() - lastFetchAt);
  if (wait > 0) await sleep(wait);
  const result = await fn();
  lastFetchAt = Date.now();
  return result;
}

async function fetchRaw(url: string): Promise<{ html?: string; bytes?: Uint8Array }> {
  const file = rawCacheFile(url);
  if (existsSync(file)) {
    return isPdf(url) ? { bytes: new Uint8Array(readFileSync(file)) } : { html: readFileSync(file, "utf8") };
  }
  if (isPdf(url)) {
    const bytes = await paced(() => fetchBytes("sources", url));
    writeFileSync(file, bytes);
    return { bytes };
  }
  const html = await paced(() => fetchText("sources", url));
  writeFileSync(file, html);
  return { html };
}

type PdfjsLegacy = typeof import("pdfjs-dist/legacy/build/pdf.mjs");
type PdfDocumentProxy = Awaited<ReturnType<PdfjsLegacy["getDocument"]>["promise"]>;

/** pdfjs's legacy Node build runs the worker in-process -- no DOM/canvas needed
 * for text extraction. Lines break wherever pdfjs marks an end-of-line.
 *
 * Takes an already-opened `doc` (rather than opening its own) so a caller that
 * also needs to render the same PDF (the OCR fallback) can share one document:
 * pdfjs's in-process "fake worker" -- the simulated worker thread it runs when
 * there's no real Worker -- gets into a broken state (a DataCloneError from
 * its internal postMessage) if two separate getDocument() calls for the same
 * bytes are both used to extract text and to render within one process. */
async function extractPdfLinesFromDoc(doc: PdfDocumentProxy): Promise<string[]> {
  const lines: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    let line = "";
    for (const item of content.items as { str?: string; hasEOL?: boolean }[]) {
      if (typeof item.str !== "string") continue;
      // eslint-disable-next-line no-control-regex -- PDFs can carry NUL and other control bytes
      line += item.str.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
      if (item.hasEOL) {
        if (line.trim()) lines.push(line.trim());
        line = "";
      }
    }
    if (line.trim()) lines.push(line.trim());
  }
  return lines;
}

// --- OCR fallback for obfuscated-font PDFs -----------------------------------
//
// Some Google Drive PDFs (the ARHU sample four-year plans) use an obfuscated
// font: pdfjs's text layer decodes to visual garbage even though the page
// renders correctly. isPdfTextUnreadable flags that case (pure, unit-tested);
// ocrPdfPages is the fallback, rendering each page to a bitmap with pdfjs +
// @napi-rs/canvas and reading it back with tesseract.js.

export const OCR_NOTE = "(OCR text; may contain recognition errors)";

const COURSE_CODE_RE = /\b[A-Z]{4} ?\d{3}\b/g;
/** Common English words that show up in almost any prose or a four-year-plan
 * legend, but essentially never survive a font-substitution cipher by chance
 * (see packages/catalog/test/fetch-sources.test.ts for the calibration against
 * real garbled vs. real clean extracted text). */
const COMMON_ENGLISH_WORDS = new Set([
  "the", "and", "for", "with", "are", "this", "that", "from", "your", "will",
  "students", "student", "course", "courses", "credit", "credits", "must",
  "program", "required", "requirement", "requirements", "year", "semester",
  "degree", "major", "plan", "complete", "least", "total", "also",
]);

/** True when extracted PDF text looks like font-substitution garbage rather
 * than real English: almost no course-code-like tokens (`CHIN 301`, `ENGL101`)
 * and almost no common English words. Either signal alone being strong (real
 * course codes, or real prose with no course codes -- e.g. a department
 * overview page) is enough to call the text readable. */
export function isPdfTextUnreadable(lines: string[]): boolean {
  const text = lines.join("\n");
  const courseCodes = text.match(COURSE_CODE_RE) ?? [];
  if (courseCodes.length >= 2) return false;
  const words = text.match(/[A-Za-z]+/g) ?? [];
  if (words.length === 0) return true;
  const commonHits = words.filter((w) => COMMON_ENGLISH_WORDS.has(w.toLowerCase())).length;
  return commonHits / words.length < 0.05;
}

/** pdfjs's Node canvas factory hook, backed by @napi-rs/canvas (prebuilt
 * binaries, no native build step). */
class NodeCanvasFactory {
  create(width: number, height: number) {
    const canvas = createCanvas(width, height);
    return { canvas, context: canvas.getContext("2d") as SKRSContext2D };
  }
  reset(canvasAndContext: { canvas: { width: number; height: number } }, width: number, height: number) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }
  destroy(canvasAndContext: { canvas: { width: number; height: number } | null }) {
    if (!canvasAndContext.canvas) return;
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
  }
}

const require = createRequire(import.meta.url);
/** Local traineddata (no CDN fetch at OCR time): @tesseract.js-data/eng ships
 * { code, gzip, langPath } pointed at its own bundled eng.traineddata.gz. */
const tessdataEng = require("@tesseract.js-data/eng") as { code: string; gzip: boolean; langPath: string };

let ocrWorkerPromise: Promise<import("tesseract.js").Worker> | null = null;
/** One shared worker for the whole run (loading the model per-PDF would be
 * far slower); terminated at the end of main(). */
async function getOcrWorker() {
  ocrWorkerPromise ??= (async () => {
    const { createWorker, OEM } = await import("tesseract.js");
    return createWorker(tessdataEng.code, OEM.LSTM_ONLY, {
      langPath: tessdataEng.langPath,
      gzip: tessdataEng.gzip,
      cacheMethod: "none",
    });
  })();
  return ocrWorkerPromise;
}

/** Renders every page of an already-opened PDF to a bitmap and OCRs it. Slow
 * (a few seconds a page) -- only called when isPdfTextUnreadable said the text
 * layer is junk. Takes `doc` rather than opening its own, see
 * extractPdfLinesFromDoc's comment for why. */
async function ocrPdfPages(doc: PdfDocumentProxy): Promise<string[]> {
  const factory = new NodeCanvasFactory();
  const worker = await getOcrWorker();
  const lines: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvasAndContext = factory.create(viewport.width, viewport.height);
    // pdfjs's own types want a DOM canvas/context; @napi-rs/canvas's are close
    // enough for rendering but omit a couple of browser-only methods pdfjs
    // never calls (e.g. drawFocusIfNeeded).
    await page.render({
      canvas: canvasAndContext.canvas as unknown as HTMLCanvasElement,
      canvasContext: canvasAndContext.context as unknown as CanvasRenderingContext2D,
      viewport,
    }).promise;
    const png = canvasAndContext.canvas.toBuffer("image/png");
    const { data } = await worker.recognize(png);
    for (const rawLine of data.text.split("\n")) {
      const line = rawLine.trim();
      if (line) lines.push(line);
    }
    factory.destroy(canvasAndContext);
  }
  return lines;
}

/** The OCR cache file that sits next to a cached PDF, e.g.
 * `foo.pdf` -> `foo.ocr.txt`. Re-running the fetch skips OCR entirely once
 * this exists, since OCR is by far the slowest step. */
function ocrCacheFile(pdfFile: URL): URL {
  return new URL(pdfFile.href.replace(/\.pdf$/i, ".ocr.txt"));
}

/** Extracts a PDF's text, falling back to cached-or-fresh OCR when the text
 * layer is unreadable. Returns lines with an OCR_NOTE marker prepended when
 * OCR was used, so renderProgramDoc's plain `p.lines` path surfaces it. */
async function extractPdfLinesWithOcrFallback(bytes: Uint8Array, pdfFile: URL): Promise<string[]> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const doc = await pdfjs.getDocument({ data: bytes, useWorkerFetch: false, disableFontFace: true }).promise;
  const lines = await extractPdfLinesFromDoc(doc);
  if (!isPdfTextUnreadable(lines)) return lines;

  const cacheFile = ocrCacheFile(pdfFile);
  if (existsSync(cacheFile)) {
    const cached = readFileSync(cacheFile, "utf8").split("\n").filter(Boolean);
    return [OCR_NOTE, ...cached];
  }
  const ocrLines = await ocrPdfPages(doc);
  writeFileSync(cacheFile, ocrLines.join("\n"));
  return [OCR_NOTE, ...ocrLines];
}

const CONTENT_SELECTORS = ["#textcontainer", "main", "#main", "#content", ".main-content", "article", "body"];
/** Catalog college/department pages keep their requirements in extra tabs after #textcontainer
 * (e.g. the Smith School's shared business core is under "College Requirements"). */
const CATALOG_EXTRA_TABS = ["#collegerequirementstextcontainer", "#requirementstextcontainer"];
function extractGenericPage(html: string): string[] {
  const overview = extractSection(html, "#textcontainer");
  if (overview?.length) {
    const extra = CATALOG_EXTRA_TABS.flatMap((selector) => extractSection(html, selector) ?? []);
    return [...overview, ...extra];
  }
  for (const selector of CONTENT_SELECTORS) {
    const blocks = extractSection(html, selector);
    if (blocks && blocks.length) return blocks;
  }
  return [];
}

/** Fetches (or reads from cache) one department/sample-plan URL. Never throws:
 * a fetch error or an unconvertible format becomes a note in the page's own
 * section instead of failing the whole program. */
async function fetchPage(url: string): Promise<PageContent & { failure?: string; unconvertedReason?: string }> {
  if (isGoogleDoc(url)) return { url, lines: null, note: "Not converted (Google Docs/Sheets link).", unconvertedReason: "Google Docs/Sheets" };
  if (isUnconvertibleDoc(url)) return { url, lines: null, note: "Not converted (spreadsheet/document format).", unconvertedReason: "spreadsheet/document" };
  try {
    const raw = await fetchRaw(url);
    if (raw.bytes) return { url, lines: await extractPdfLinesWithOcrFallback(raw.bytes, rawCacheFile(url)) };
    return { url, lines: extractGenericPage(raw.html!) };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { url, lines: null, note: `Not converted (fetch failed: ${message}).`, failure: message };
  }
}

// --- main ----------------------------------------------------------------------

async function main() {
  const indexHtml = readCatalogPage(PROGRAM_INDEX_URL);
  if (!indexHtml) {
    console.error(`Program index not cached at ${catalogCacheFile(PROGRAM_INDEX_URL)}`);
    process.exit(1);
  }
  const programs = parseProgramIndex(indexHtml);
  const keys = deriveProgramKeys(programs.map((p) => p.url));

  if (SEED) {
    const existing: SourcesMap = existsSync(SOURCES_JSON) ? JSON.parse(readFileSync(SOURCES_JSON, "utf8")) : {};
    const seeded: SourcesMap = {};
    for (const program of programs) {
      const key = keys.get(program.url)!;
      const html = readCatalogPage(program.url);
      if (!html) continue;
      seeded[key] = { catalog: program.url, ...seedProgramLinks(html, program.url) };
    }
    const merged = mergeSourceMap(existing, seeded);
    const sorted: SourcesMap = {};
    for (const key of Object.keys(merged).sort()) sorted[key] = merged[key]!;
    writeFileSync(SOURCES_JSON, `${JSON.stringify(sorted, null, 2)}\n`);
    const withDept = Object.values(sorted).filter((e) => e.department.length > 0).length;
    const withPlan = Object.values(sorted).filter((e) => e.samplePlan.length > 0).length;
    console.log(
      `Seeded ${Object.keys(seeded).length} programs from the cache; sources.json now has ${Object.keys(sorted).length} entries ` +
        `(${withDept} with a department link, ${withPlan} with a sample-plan link, ${Object.keys(sorted).length - withDept} with none).`,
    );
    process.exit(0);
  }

  const sources: SourcesMap = existsSync(SOURCES_JSON) ? JSON.parse(readFileSync(SOURCES_JSON, "utf8")) : {};
  const fetchDate = new Date().toISOString().slice(0, 10);
  const missing: MissingEntry[] = [];
  let written = 0;
  let skipped = 0;

  try {
    for (const [i, program] of programs.entries()) {
      const key = keys.get(program.url)!;
      const entry = sources[key];
      const html = readCatalogPage(program.url);
      const failures: { url: string; error: string }[] = [];
      const unconverted: { url: string; reason: string }[] = [];

      if (!html) {
        failures.push({ url: program.url, error: "not in the catalog cache" });
        missing.push({
          key,
          name: program.name,
          noDepartment: !entry?.department.length,
          noSamplePlan: !entry?.samplePlan.length,
          failures,
          unconverted,
        });
        continue;
      }

      const requirements = extractSection(html, "#requirementstextcontainer") ?? [];
      const plan = extractSection(html, "#fouryearplantextcontainer");

      const department: PageContent[] = [];
      for (const url of entry?.department ?? []) {
        const page = await fetchPage(url);
        if (page.failure) failures.push({ url, error: page.failure });
        if (page.unconvertedReason) unconverted.push({ url, reason: page.unconvertedReason });
        department.push(page);
      }
      const samplePlan: PageContent[] = [];
      for (const url of entry?.samplePlan ?? []) {
        const page = await fetchPage(url);
        if (page.failure) failures.push({ url, error: page.failure });
        if (page.unconvertedReason) unconverted.push({ url, reason: page.unconvertedReason });
        samplePlan.push(page);
      }

      const outFile = new URL(`${key}.md`, SOURCES_DIR);
      const priorContent = existsSync(outFile) ? readFileSync(outFile, "utf8") : null;
      if (priorContent !== null && !hasGeneratedHeader(priorContent)) {
        skipped++;
        console.error(`Skipped ${key}.md: hand-captured file, no generated header.`);
      } else {
        writeFileSync(outFile, renderProgramDoc({ name: program.name, catalogUrl: program.url, fetchDate, requirements, plan, department, samplePlan }));
        written++;
      }

      if (!entry?.department.length || !entry?.samplePlan.length || failures.length || unconverted.length) {
        missing.push({
          key,
          name: program.name,
          noDepartment: !entry?.department.length,
          noSamplePlan: !entry?.samplePlan.length,
          failures,
          unconverted,
        });
      }

      if ((i + 1) % 25 === 0) console.error(`${i + 1}/${programs.length}`);
    }
  } finally {
    // Only awaits/terminates a worker if OCR fallback actually spun one up.
    if (ocrWorkerPromise) {
      const worker = await ocrWorkerPromise;
      await worker.terminate();
    }
  }

  writeFileSync(new URL("missing.md", SOURCES_DIR), buildMissingReport(missing));
  console.log(`Wrote ${written} program file(s); skipped ${skipped} hand-captured file(s). ${missing.length} program(s) listed in missing.md.`);
}

const isMainModule = process.argv[1] !== undefined && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isMainModule) {
  await main();
}

// How much of the whole undergraduate catalog the program parser understands.
//
//   node scripts/coverage.ts            (from packages/catalog)
//
// Fetches the program index, then every program page one at a time with a
// 500 ms pause between requests. Raw HTML is cached in .cache/catalog/ (git-
// ignored), so re-runs only fetch pages that are missing. Prints the report and
// writes it to coverage-report.md.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
import { fetchText } from "@turboterp/campus-data/http";
import { parseProgramPage } from "../src/program.ts";
import { PROGRAM_INDEX_URL, parseProgramIndex } from "../src/programs-index.ts";
import { renderReport, summarize, type PageResult } from "./coverage-report.ts";

const CACHE = new URL("../.cache/catalog/", import.meta.url);
const REPORT = new URL("../coverage-report.md", import.meta.url);
const PAUSE_MS = 500;

mkdirSync(CACHE, { recursive: true });

const cacheFile = (url: string) => {
  const slug = new URL(url).pathname.replace(/^\/+|\/+$/g, "").replace(/[^A-Za-z0-9-]+/g, "_") || "root";
  return new URL(`${slug}.html`, CACHE);
};

/** Cached HTML, or a polite fetch (then a pause) that fills the cache. */
async function get(url: string): Promise<string> {
  const file = cacheFile(url);
  if (existsSync(file)) return readFileSync(file, "utf8");
  const html = await fetchText("catalog", url);
  writeFileSync(file, html);
  await sleep(PAUSE_MS);
  return html;
}

const programs = parseProgramIndex(await get(PROGRAM_INDEX_URL));
console.error(`${programs.length} programs on the index`);

const results: PageResult[] = [];
for (const [i, program] of programs.entries()) {
  try {
    const html = await get(program.url);
    results.push({ program, page: parseProgramPage(html), planGrid: html.includes('class="sc_plangrid"') });
  } catch (err) {
    results.push({ program, error: err instanceof Error ? err.message : String(err) });
  }
  if ((i + 1) % 25 === 0) console.error(`  ${i + 1}/${programs.length}`);
}

const report = renderReport(summarize(results), { generated: new Date().toISOString().slice(0, 10) });
writeFileSync(REPORT, report);
console.log(report);

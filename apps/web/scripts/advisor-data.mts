// Builds the Advisor tab's static data into public/data/ (gitignored; derived from scraped data):
//
//   public/data/advisor/index.json                  { v, term, terms, generatedAt, catalog, details, grades }
//   public/data/advisor/<term>/catalog.json         the plan catalog (@turboterp/plan catalog-file, v1)
//   public/data/advisor/<term>/courses/<DEPT>.json  descriptions and printed prerequisite texts
//   public/data/grades/<DEPT>.json                  PlanetTerp grade files, copied as-is (GRADES.md)
//
// Everything is served as CDN-cacheable static files; pages never scrape. The term-versioned
// paths never change content, so they can be cached for a long time; only index.json is short-lived.
//
//   npm run advisor-data -w @turboterp/web [-- --soc <path/to/soc-YYYYMM.json>]
//
// Inputs: every packages/course-data/.cache/soc-*.json (or the one --soc file) and
// packages/ratings/.cache/grades-out/. The catalog and course details span ALL cached terms merged
// (a course seen in any term is known; the newest term's record wins), so fall-only courses such
// as CMNS100 resolve. index.json's `term` is the newest term (the one whose sections the app
// shows); `terms` lists every term merged.
// With no snapshot (e.g. in CI) it prints a note and exits 0: the app then says course data
// isn't built.
//
// Meant to be unified with the schedule builder's data step later (same source, same grade files).

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { mergeSnapshots, type Course } from "@turboterp/course-data";
import { buildCatalog } from "@turboterp/plan/catalog";
import { encodeCatalogFile } from "@turboterp/plan/catalog-file";
import { courseDetailFiles } from "../lib/advisor/course-details.ts";

const web = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repo = resolve(web, "../..");
const out = join(web, "public", "data");

function snapshotPaths(): string[] {
  const flag = process.argv.indexOf("--soc");
  if (flag >= 0) return [resolve(process.argv[flag + 1]!)];
  const dir = join(repo, "packages/course-data/.cache");
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => /^soc-\d{6}\.json$/.test(f)).sort().map((f) => join(dir, f));
}

const socPaths = snapshotPaths().filter((p) => existsSync(p));
if (!socPaths.length) {
  console.log("advisor-data: no Schedule of Classes snapshot found; skipping (the Advisor tab will say course data isn't built).");
  process.exit(0);
}

type Snapshot = { term: string; fetchedAt: string; courses: Course[] };
const snapshots = socPaths.map((p) => JSON.parse(readFileSync(p, "utf8")) as Snapshot).sort((a, b) => a.term.localeCompare(b.term));
const newest = snapshots.at(-1)!;
const term = newest.term;
const terms = snapshots.map((s) => s.term);
const courses = mergeSnapshots(snapshots);
const generatedAt = new Date().toISOString();
const termDir = join(out, "advisor", term);
rmSync(termDir, { recursive: true, force: true });
mkdirSync(join(termDir, "courses"), { recursive: true });

const write = (path: string, data: unknown) => {
  const text = JSON.stringify(data);
  writeFileSync(path, text);
  return { bytes: text.length, gzip: gzipSync(text).length };
};

const t = performance.now();
const catalog = buildCatalog(courses);
const catalogSize = write(join(termDir, "catalog.json"), encodeCatalogFile(catalog, { term, generatedAt: newest.fetchedAt }));

let detailBytes = 0;
const details = courseDetailFiles(courses, term);
for (const [dept, file] of Object.entries(details)) detailBytes += write(join(termDir, "courses", `${dept}.json`), file).bytes;

// Grade files: copied unchanged, so the schedule builder can share them.
const gradesIn = join(repo, "packages/ratings/.cache/grades-out");
let gradeFiles = 0;
let gradeBytes = 0;
if (existsSync(gradesIn)) {
  const gradesOut = join(out, "grades");
  rmSync(gradesOut, { recursive: true, force: true });
  mkdirSync(gradesOut, { recursive: true });
  for (const f of readdirSync(gradesIn).filter((f) => f.endsWith(".json"))) {
    copyFileSync(join(gradesIn, f), join(gradesOut, f));
    gradeFiles++;
    gradeBytes += statSync(join(gradesIn, f)).size;
  }
}

write(join(out, "advisor", "index.json"), {
  v: 1,
  term,
  terms,
  generatedAt,
  catalog: `${term}/catalog.json`,
  details: `${term}/courses/`,
  grades: gradeFiles > 0 ? "../grades/" : null,
});

const kb = (n: number) => `${(n / 1024).toFixed(0)} KB`;
console.log(`advisor-data: term ${term} (merged ${terms.join(", ")}), ${catalog.size} courses in ${(performance.now() - t).toFixed(0)} ms`);
console.log(`  catalog.json ${kb(catalogSize.bytes)} (${kb(catalogSize.gzip)} gzipped)`);
console.log(`  course details: ${Object.keys(details).length} department files, ${kb(detailBytes)} in all`);
console.log(`  grade files: ${gradeFiles} copied, ${kb(gradeBytes)} in all${gradeFiles ? "" : " (none found; course sheets will say there's no grade data)"}`);

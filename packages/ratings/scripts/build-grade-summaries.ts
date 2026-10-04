// Builds the pre-computed grade-distribution files (format in ../GRADES.md).
// Reads the courses offered from the newest Schedule of Classes snapshot,
// fetches each course's PlanetTerp grades ONE AT A TIME with a 500 ms pause,
// caches every raw response in .cache/planetterp-grades/ (a rerun skips
// cached courses, so it resumes), then writes one <DEPT>.json per department
// plus index.json into the output directory. Run once per term:
//
//   npm run grades -w @turboterp/ratings [-- <outDir>] [--soc <soc-YYYYMM.json>]
//
// Default outDir: packages/ratings/.cache/grades-out/

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchGradesRaw, parseGrades } from "../src/planetterp.ts";
import { summarizeCourseGrades, type CourseGrades, type NameReport } from "../src/course-grades.ts";
import { coursesOffered, encodeDepartment } from "../src/grade-files.ts";

const PAUSE_MS = 500;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const pkg = fileURLToPath(new URL("..", import.meta.url));
const args = process.argv.slice(2);
const socFlag = args.indexOf("--soc");
const socArg = socFlag >= 0 ? args.splice(socFlag, 2)[1] : undefined;
const outDir = resolve(args[0] ?? join(pkg, ".cache", "grades-out"));
const rawDir = join(pkg, ".cache", "planetterp-grades");

function newestSoc(): string {
  const dir = join(pkg, "..", "course-data", ".cache");
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => /^soc-\d{6}\.json$/.test(f)).sort() : [];
  if (files.length === 0) throw new Error(`No soc-<term>.json in ${dir}; run the course-data snapshot first`);
  return join(dir, files.at(-1)!);
}

const socPath = resolve(socArg ?? newestSoc());
const snapshot = JSON.parse(readFileSync(socPath, "utf8")) as { term: string };
const offered = coursesOffered(snapshot);
console.log(`SOC ${snapshot.term}: ${offered.length} courses (${socPath})`);

// ---- 1. fetch (polite, resumable) ----

mkdirSync(rawDir, { recursive: true });
const rawFile = (id: string) => join(rawDir, `${id}.json`);
const todo = offered.filter((c) => !existsSync(rawFile(c.id)));
console.log(`${offered.length - todo.length} already cached, ${todo.length} to fetch`);
const failed: string[] = [];
for (const [i, c] of todo.entries()) {
  try {
    writeFileSync(rawFile(c.id), JSON.stringify(await fetchGradesRaw(c.id)));
  } catch (err) {
    failed.push(c.id);
    console.warn(`  ${c.id}: ${(err as Error).message}`);
  }
  if (i % 100 === 0) console.log(`  fetched ${i + 1}/${todo.length}`);
  await sleep(PAUSE_MS);
}

// ---- 2. summarize and write ----

mkdirSync(outDir, { recursive: true });
const generatedAt = new Date().toISOString();
const byDept = new Map<string, CourseGrades[]>();
const nameReport: Record<string, NameReport> = {};
let withData = 0;
let withoutData = 0;
let renamed = 0;
let unmatched = 0;
for (const c of offered) {
  if (!existsSync(rawFile(c.id))) continue; // failed this run; a rerun retries it
  const { names, ...grades } = summarizeCourseGrades(
    c.id,
    parseGrades(JSON.parse(readFileSync(rawFile(c.id), "utf8"))),
    c.instructors,
  );
  if (grades.overall.students > 0) withData++;
  else withoutData++;
  if (names.renamed.length || names.unmatched.length) nameReport[c.id] = names;
  renamed += names.renamed.length;
  unmatched += names.unmatched.length;
  byDept.set(c.department, [...(byDept.get(c.department) ?? []), grades]);
}

const departments: Record<string, { courses: number; withData: number; bytes: number }> = {};
let totalBytes = 0;
for (const [dept, courses] of [...byDept].sort(([a], [b]) => a.localeCompare(b))) {
  const file = encodeDepartment({ department: dept, term: snapshot.term, generatedAt }, courses);
  const json = JSON.stringify(file);
  writeFileSync(join(outDir, `${dept}.json`), json);
  const bytes = Buffer.byteLength(json);
  totalBytes += bytes;
  departments[dept] = { courses: courses.length, withData: Object.keys(file.courses).length, bytes };
}

const index = {
  v: 1,
  source: "planetterp.com",
  term: snapshot.term,
  generatedAt,
  counts: {
    offered: offered.length,
    withData,
    withoutData,
    failed: failed.length,
    renamedProfessors: renamed,
    unmatchedInstructors: unmatched,
    departments: Object.keys(departments).length,
    bytes: totalBytes,
  },
  departments,
};
writeFileSync(join(outDir, "index.json"), JSON.stringify(index));
writeFileSync(join(pkg, ".cache", "grade-name-report.json"), JSON.stringify(nameReport, null, 1));

const sizes = Object.values(departments).map((d) => d.bytes).sort((a, b) => a - b);
console.log(JSON.stringify(index.counts));
console.log(`median department file ${sizes[Math.floor(sizes.length / 2)]} B, largest ${sizes.at(-1)} B`);
console.log(`index.json ${statSync(join(outDir, "index.json")).size} B; wrote to ${outDir}`);
if (failed.length) console.log(`failed (rerun to retry): ${failed.join(" ")}`);

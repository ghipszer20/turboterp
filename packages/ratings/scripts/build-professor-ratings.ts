// Builds professor ratings and review summaries for the instructors in the newest Schedule
// of Classes snapshot. Pages through PlanetTerp's GET /professors?reviews=true (100 per
// page, the API's maximum) ONE AT A TIME with a 500 ms pause, caching each raw page in
// .cache/planetterp-professors-reviews/ so a rerun resumes (delete that folder to refetch,
// e.g. once per term). Writes .cache/professor-ratings.json:
// { v, term, generatedAt, ratings: { "<SOC name>": 4.2 } }, and one summary per matched
// instructor in .cache/reviews-out/<instructorFileKey>.json plus .cache/reviews-out/index.json
// ({ v, term, generatedAt, names: ["<SOC name>"] }) which the schedule-data build publishes.
//
//   npm run professor-ratings -w @turboterp/ratings [-- --soc <soc-YYYYMM.json>]

import { existsSync, mkdirSync, readdirSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchJson } from "@turboterp/campus-data/http";
import { coursesOffered } from "../src/grade-files.ts";
import { instructorFileKey, reviewSummariesForInstructors } from "../src/review-summary.ts";
import { parseProfessorList, ratingsForInstructors, type ProfessorRating } from "../src/professor-ratings.ts";

const PAGE = 100;
const PAUSE_MS = 500;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const pkg = fileURLToPath(new URL("..", import.meta.url));
const args = process.argv.slice(2);
const socFlag = args.indexOf("--soc");
const rawDir = join(pkg, ".cache", "planetterp-professors-reviews");

function newestSoc(): string {
  const dir = join(pkg, "..", "course-data", ".cache");
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => /^soc-\d{6}\.json$/.test(f)).sort() : [];
  if (files.length === 0) throw new Error(`No soc-<term>.json in ${dir}; run the course-data snapshot first`);
  return join(dir, files.at(-1)!);
}

const socPath = resolve(socFlag >= 0 ? args[socFlag + 1]! : newestSoc());
const snapshot = JSON.parse(readFileSync(socPath, "utf8")) as { term: string };
const instructors = [...new Set(coursesOffered(snapshot).flatMap((c) => c.instructors))];
console.log(`SOC ${snapshot.term}: ${instructors.length} instructors`);

mkdirSync(rawDir, { recursive: true });
const professors: ProfessorRating[] = [];
const entries: unknown[] = [];
for (let offset = 0; ; offset += PAGE) {
  const file = join(rawDir, `page-${offset}.json`);
  let raw: unknown;
  if (existsSync(file)) raw = JSON.parse(readFileSync(file, "utf8"));
  else {
    raw = await fetchJson<unknown>("planetterp", `https://planetterp.com/api/v1/professors?limit=${PAGE}&offset=${offset}&reviews=true`);
    writeFileSync(file, JSON.stringify(raw));
    await sleep(PAUSE_MS);
  }
  const page = parseProfessorList(raw);
  professors.push(...page);
  entries.push(...(raw as unknown[]));
  if (offset % 2000 === 0) console.log(`  ${professors.length} professors`);
  if (page.length < PAGE) break;
}

const ratings = ratingsForInstructors(professors, instructors);
const out = join(pkg, ".cache", "professor-ratings.json");
writeFileSync(out, JSON.stringify({ v: 1, term: snapshot.term, generatedAt: new Date().toISOString(), ratings }));
console.log(`${professors.length} PlanetTerp professors; rated ${Object.keys(ratings).length} of ${instructors.length} instructors → ${out}`);

// Review summaries. Two SOC spellings that share a file key but not a professor are dropped
// (never guess), as are keys that would be empty.
const summaries = reviewSummariesForInstructors(entries, instructors);
const byKey = new Map<string, string[]>();
for (const name of Object.keys(summaries)) byKey.set(instructorFileKey(name), [...(byKey.get(instructorFileKey(name)) ?? []), name]);
const reviewsOut = join(pkg, ".cache", "reviews-out");
rmSync(reviewsOut, { recursive: true, force: true });
mkdirSync(reviewsOut, { recursive: true });
const names: string[] = [];
for (const [key, group] of byKey) {
  if (!key || new Set(group.map((n) => summaries[n]!.slug)).size !== 1) continue;
  writeFileSync(join(reviewsOut, `${key}.json`), JSON.stringify({ v: 1, ...summaries[group[0]!]! }));
  names.push(...group);
}
writeFileSync(join(reviewsOut, "index.json"), JSON.stringify({ v: 1, term: snapshot.term, generatedAt: new Date().toISOString(), names: names.sort() }));
console.log(`Review summaries for ${names.length} instructors → ${reviewsOut}`);

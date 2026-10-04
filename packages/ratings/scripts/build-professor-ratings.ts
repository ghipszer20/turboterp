// Builds professor ratings for the instructors in the newest Schedule of Classes snapshot.
// Pages through PlanetTerp's GET /professors (100 per page, the API's maximum) ONE AT A
// TIME with a 500 ms pause, caching each raw page in .cache/planetterp-professors/ so a
// rerun resumes (delete that folder to refetch, e.g. once per term). Writes
// .cache/professor-ratings.json: { v, term, generatedAt, ratings: { "<SOC name>": 4.2 } }.
//
//   npm run professor-ratings -w @turboterp/ratings [-- --soc <soc-YYYYMM.json>]

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchJson } from "@turboterp/campus-data/http";
import { coursesOffered } from "../src/grade-files.ts";
import { parseProfessorList, ratingsForInstructors, type ProfessorRating } from "../src/professor-ratings.ts";

const PAGE = 100;
const PAUSE_MS = 500;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const pkg = fileURLToPath(new URL("..", import.meta.url));
const args = process.argv.slice(2);
const socFlag = args.indexOf("--soc");
const rawDir = join(pkg, ".cache", "planetterp-professors");

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
for (let offset = 0; ; offset += PAGE) {
  const file = join(rawDir, `page-${offset}.json`);
  let raw: unknown;
  if (existsSync(file)) raw = JSON.parse(readFileSync(file, "utf8"));
  else {
    raw = await fetchJson<unknown>("planetterp", `https://planetterp.com/api/v1/professors?limit=${PAGE}&offset=${offset}`);
    writeFileSync(file, JSON.stringify(raw));
    await sleep(PAUSE_MS);
  }
  const page = parseProfessorList(raw);
  professors.push(...page);
  if (offset % 2000 === 0) console.log(`  ${professors.length} professors`);
  if (page.length < PAGE) break;
}

const ratings = ratingsForInstructors(professors, instructors);
const out = join(pkg, ".cache", "professor-ratings.json");
writeFileSync(out, JSON.stringify({ v: 1, term: snapshot.term, generatedAt: new Date().toISOString(), ratings }));
console.log(`${professors.length} PlanetTerp professors; rated ${Object.keys(ratings).length} of ${instructors.length} instructors → ${out}`);

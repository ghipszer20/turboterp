// Builds the schedule builder's data (format in ../SCHEDULE_FILES.md) into the snapshot
// store the web app serves from (packages/campus-data/SNAPSHOTS.md). Run once per Schedule
// of Classes snapshot, after the optional ratings and grade builds:
//
//   npm run schedule-data -w @turboterp/course-data
//     [-- --soc <soc-YYYYMM.json>] [--ratings <professor-ratings.json>] [--grades <grades-out dir>] [--dir <snapshot dir>]
//
// Writes (keys in the snapshot store):
//   schedule/current                    { term }  (which term the app shows)
//   schedule/<term>/index               course index for search
//   schedule/<term>/sections/<DEPT>     sections + instructor ratings, one department
//   schedule/<term>/grades/<DEPT>       grade distributions (copied from @turboterp/ratings' build)

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { FileSnapshotStore, openSnapshotStore, type SnapshotStore } from "@turboterp/campus-data/snapshots";
import { buildScheduleFiles } from "../src/schedule-files.ts";

const pkg = fileURLToPath(new URL("..", import.meta.url));
const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

function newestSoc(): string {
  const dir = join(pkg, ".cache");
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => /^soc-\d{6}\.json$/.test(f)).sort() : [];
  if (files.length === 0) throw new Error(`No soc-<term>.json in ${dir}; run \`npm run snapshot\` first`);
  return join(dir, files.at(-1)!);
}

const socPath = resolve(flag("--soc") ?? newestSoc());
const ratingsPath = resolve(flag("--ratings") ?? join(pkg, "..", "ratings", ".cache", "professor-ratings.json"));
const gradesDir = resolve(flag("--grades") ?? join(pkg, "..", "ratings", ".cache", "grades-out"));
const dirArg = flag("--dir");
const store: SnapshotStore = dirArg ? new FileSnapshotStore(dirArg) : openSnapshotStore();

const snapshot = JSON.parse(readFileSync(socPath, "utf8"));
const ratings = existsSync(ratingsPath)
  ? (JSON.parse(readFileSync(ratingsPath, "utf8")) as { ratings: Record<string, number> }).ratings
  : {};
if (!existsSync(ratingsPath)) console.warn(`No ratings at ${ratingsPath}: every professor will show as unrated`);

const updatedAt = snapshot.fetchedAt ?? new Date().toISOString();
const { index, departments } = buildScheduleFiles(snapshot, { ratings, generatedAt: new Date().toISOString() });
const term: string = snapshot.term;
const size = (x: unknown) => JSON.stringify(x).length;

await store.put(`schedule/${term}/index`, { updatedAt, data: index });
let bytes = 0;
for (const [dept, file] of Object.entries(departments)) {
  await store.put(`schedule/${term}/sections/${dept}`, { updatedAt, data: file });
  bytes += size(file);
}
let grades = 0;
let gradeBytes = 0;
if (existsSync(gradesDir)) {
  for (const f of readdirSync(gradesDir).filter((f) => /^[A-Z]{4}\.json$/.test(f))) {
    const data = JSON.parse(readFileSync(join(gradesDir, f), "utf8"));
    await store.put(`schedule/${term}/grades/${f.slice(0, 4)}`, { updatedAt: data.generatedAt ?? updatedAt, data });
    grades++;
    gradeBytes += size(data);
  }
} else console.warn(`No grade files at ${gradesDir}: the section panel will say "No grade data"`);
// Written last, so the app never points at a term whose files aren't all there.
await store.put("schedule/current", { updatedAt, data: { term } });

const kb = (n: number) => `${(n / 1024).toFixed(0)} KB`;
console.log(`Term ${term} → ${store instanceof FileSnapshotStore ? store.dir : "Supabase Storage"}`);
console.log(`  index: ${index.courses.length} courses, ${kb(size(index))}`);
console.log(`  sections: ${Object.keys(departments).length} departments, ${kb(bytes)} total, largest ${
  Object.entries(departments).map(([d, f]) => [d, size(f)] as const).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([d, n]) => `${d} ${kb(n)}`).join(", ")
}`);
console.log(`  ratings: ${Object.keys(ratings).length} instructors`);
console.log(`  grades: ${grades} departments, ${kb(gradeBytes)} total`);

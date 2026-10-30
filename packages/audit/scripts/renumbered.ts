// The Renumbered Twins that program files must not name: old course codes that Testudo's "Formerly"
// lines map to a current course and that are not themselves known courses (so the planner would show
// them with no title or credits). Read from the Testudo snapshots in the main checkout's gitignored
// packages/course-data/.cache (+ history/), the way packages/plan/scripts/unknown-courses.ts does.
//
// Shared by replace-formerly.ts (the codemod) and test/formerly-codes.test.ts (the registry check).

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { Course } from "@turboterp/course-data";
import { parseTwinLine } from "../../plan/src/twins.ts";

export function cacheDir(): string {
  const common = execFileSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], { encoding: "utf8" }).trim();
  return join(dirname(resolve(common)), "packages", "course-data", ".cache");
}

const readCourses = (p: string) => (JSON.parse(readFileSync(p, "utf8")) as { courses: Course[] }).courses;
const socIn = (dir: string) =>
  existsSync(dir) ? readdirSync(dir).filter((f) => /^soc-\d{6}\.json$/.test(f)).map((f) => join(dir, f)) : [];

/** Every known course (snapshots + catalog cache), or null when the cache isn't on this machine. */
export function loadCourses(dir = cacheDir()): Map<string, Course> | null {
  const files = [...socIn(dir), ...socIn(join(dir, "history"))];
  const catalogPath = join(dir, "catalog-courses.json");
  if (files.length === 0 && !existsSync(catalogPath)) return null;
  const all = new Map<string, Course>();
  for (const p of files) for (const c of readCourses(p)) all.set(c.id, c);
  if (existsSync(catalogPath)) for (const c of readCourses(catalogPath)) if (!all.has(c.id)) all.set(c.id, c);
  return all;
}

/** Old code -> the current courses whose Formerly line names it (old codes that are known courses are left out). */
export function renumberedTwins(courses: Map<string, Course>): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const c of courses.values()) {
    for (const old of parseTwinLine(c.texts.other["Formerly"], c.id).codes) {
      if (courses.has(old)) continue;
      const list = out.get(old) ?? [];
      if (!list.includes(c.id)) list.push(c.id);
      out.set(old, list);
    }
  }
  return out;
}

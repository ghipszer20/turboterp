// Codemod: replaces old ("Formerly") course codes in program files with the current code, so the
// planner shows a title and credits. Keep it for future renumberings.
//
//   node packages/audit/scripts/replace-formerly.ts [--dry]
//
// Reads the Renumbered Twins from the Testudo snapshots (see renumbered.ts). Only quoted code
// literals ("AASP100") are rewritten, never prose in notes. A string-only array left holding the new
// code twice is deduped (old code listed beside the new one). Skipped and reported, file untouched
// for that code:
//   - an old code that several current courses claim (ambiguous);
//   - an old code whose new code is already named in the same file outside the array holding the
//     old code (possibly a separate pick with a different meaning: read those by hand).
// Old-code transcripts still count toward the new code: the audit's namedCodes uses the Renumbered
// Twins (packages/plan/test/twin-aliases.test.ts).

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { loadCourses, renumberedTwins } from "./renumbered.ts";

const dry = process.argv.includes("--dry");
const courses = loadCourses();
if (!courses) throw new Error("No Testudo snapshots in the main checkout's packages/course-data/.cache");
const twins = renumberedTwins(courses);
const dir = new URL("../programs/", import.meta.url);

// A bracketed list of only string literals (one or many lines).
const STRING_ARRAY = /\[(?:\s*"[^"\n]*"\s*,?)+\s*\]/g;
const quoted = (code: string) => `"${code}"`;

/** Drops later copies of `code` from a string-only array, keeping its single- or multi-line layout. */
function dedupe(arr: string, code: string): string {
  if (arr.split(quoted(code)).length <= 2) return arr;
  if (!arr.includes("\n")) return `[${[...new Set(arr.match(/"[^"\n]*"/g)!)].join(", ")}]`;
  let seen = false;
  return arr
    .replace(new RegExp(`${quoted(code)}[ \\t]*,?`, "g"), (m) => (seen ? "" : ((seen = true), m)))
    .split("\n")
    .map((line) => line.replace(/,[ \t]{2,}/g, ", ").trimEnd())
    .filter((line, i) => i === 0 || line.trim() !== "")
    .join("\n");
}

const changed: string[] = [];
const skipped: string[] = [];
for (const file of readdirSync(dir).filter((f) => f.endsWith(".ts"))) {
  const path = new URL(file, dir);
  const original = readFileSync(path, "utf8");
  let text = original;
  const used = [...twins.keys()].filter((old) => text.includes(quoted(old)));
  for (const old of used) {
    const news = twins.get(old)!;
    if (news.length !== 1) {
      skipped.push(`${file}: ${old} is claimed by ${news.join(", ")}`);
      continue;
    }
    const now = news[0]!;
    // Does the new code already appear outside an array that also holds the old code?
    const arraysWithOld = text.match(STRING_ARRAY)?.filter((a) => a.includes(quoted(old))) ?? [];
    const rest = arraysWithOld.reduce((t, a) => t.replace(a, ""), text);
    if (rest.includes(quoted(now))) {
      skipped.push(`${file}: ${old} -> ${now}, but ${now} is also named elsewhere in the file (check by hand)`);
      continue;
    }
    // `exclude` lists match a transcript course's own code only (not its Renumbered Twins), so an
    // old-code transcript would slip past an exclusion naming just the new code: keep both there.
    const excludes: string[] = [];
    text = text.replace(/exclude:\s*\[[^\]]*\]/g, (m) => {
      excludes.push(m.includes(quoted(old)) && !m.includes(quoted(now)) ? m.replace(quoted(old), `${quoted(old)}, ${quoted(now)}`) : m);
      return `@@EXCLUDE${excludes.length - 1}@@`;
    });
    text = text.split(quoted(old)).join(quoted(now));
    text = text.replace(/@@EXCLUDE(\d+)@@/g, (_, i) => excludes[Number(i)]!);
    // Dedupe the new code inside every string-only array that now lists it twice.
    text = text.replace(STRING_ARRAY, (arr) => dedupe(arr, now));
    changed.push(`${file}: ${old} -> ${now}`);
  }
  if (text !== original && !dry) writeFileSync(path, text);
}
console.log(`${changed.length} replacements`);
for (const s of changed) console.log(`  ${s}`);
console.log(`${skipped.length} skipped`);
for (const s of skipped) console.log(`  ${s}`);

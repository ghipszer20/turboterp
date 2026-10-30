// Downloads one term of the Schedule of Classes (every department, course
// and section) into .cache/soc-<term>.json. Polite: one request at a time
// with a pause between them. A failed request is retried; if any department
// or section batch still fails, nothing is saved (the old file stays) and
// the script exits non-zero. Run by hand:
//
//   npm run snapshot -w @turboterp/course-data -- 202701 [--history]

import { mkdirSync, writeFileSync } from "node:fs";
import { fetchEach } from "../src/fetch-each.ts";
import { fetchCourses, fetchSections, fetchTermsAndDepartments, withExtraDepartments } from "../src/soc.ts";

const PAUSE_MS = 300;
const ATTEMPTS = 3;
const SECTION_BATCH = 40;
const pause = () => new Promise<void>((r) => setTimeout(r, PAUSE_MS));

const { terms, departments: listed } = await fetchTermsAndDepartments();
const departments = withExtraDepartments(listed);
const history = process.argv.includes("--history");
const term = process.argv.slice(2).find((a) => !a.startsWith("--")) ?? terms.find((t) => t.current)?.id;
if (!term) throw new Error("No term given and no current term found");
console.log(`Term ${term}: ${departments.length} departments`);

const codes = departments.map((d) => d.code);
let courseCount = 0;
const courseRun = await fetchEach(
  codes,
  async (code) => {
    const i = codes.indexOf(code);
    if (i % 25 === 0) console.log(`  courses: ${i + 1}/${codes.length} departments, ${courseCount} courses`);
    const found = await fetchCourses(term, code);
    courseCount += found.length;
    return found;
  },
  { attempts: ATTEMPTS, pause },
);
const courses = courseRun.items;

const ids = courses.map((c) => c.id);
const batchStarts = ids.map((_, i) => i).filter((i) => i % SECTION_BATCH === 0);
const sectionRun = await fetchEach(
  batchStarts,
  (start) => {
    if ((start / SECTION_BATCH) % 25 === 0) console.log(`  sections: ${Math.min(start + SECTION_BATCH, ids.length)}/${ids.length} courses`);
    return fetchSections(term, ids.slice(start, start + SECTION_BATCH));
  },
  { attempts: ATTEMPTS, pause },
);
const sections = sectionRun.items;

// --history keeps a past term under .cache/history/, away from the schedule builder and advisor-data.
const dir = history ? ".cache/history" : ".cache";
const file = `${dir}/soc-${term}.json`;
if (courseRun.failed.length > 0 || sectionRun.failed.length > 0) {
  for (const f of courseRun.failed) console.error(`  ${f.key}: ${f.message}`);
  for (const f of sectionRun.failed) console.error(`  sections ${f.key}-${f.key + SECTION_BATCH - 1}: ${f.message}`);
  console.error(
    `Failed after ${ATTEMPTS} attempts: ${courseRun.failed.length} departments, ${sectionRun.failed.length} section batches. ${file} was not written.`,
  );
  process.exit(1);
}

mkdirSync(dir, { recursive: true });
writeFileSync(file, JSON.stringify({ term, fetchedAt: new Date().toISOString(), departments, courses, sections }));
console.log(`Saved ${courses.length} courses and ${sections.length} sections to ${file}`);

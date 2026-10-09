// Downloads every course in the UMD Undergraduate and Graduate Catalogs into
// .cache/catalog-courses.json, for lab-coverage.ts (the catalogs list courses not offered in
// recent terms). Polite: one request at a time with a pause. Run by hand:
//
//   npm run catalog-courses -w @turboterp/course-data

import { mkdirSync, writeFileSync } from "node:fs";
import { parseCatalogCourses } from "../src/catalog-courses.ts";
import { fetchEach } from "../src/fetch-each.ts";

const SITE = "https://academiccatalog.umd.edu";
const INDEXES = [
  { index: `${SITE}/undergraduate/approved-courses/`, link: /\/undergraduate\/approved-courses\/[a-z]+\//g },
  { index: `${SITE}/graduate/courses/`, link: /\/graduate\/courses\/[a-z]+\//g },
];
const pause = () => new Promise<void>((r) => setTimeout(r, 300));
const get = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
};

const pages: string[] = [];
for (const { index, link } of INDEXES) pages.push(...new Set((await get(index)).match(link)?.map((p) => SITE + p) ?? []));
console.log(`catalog-courses: ${pages.length} department pages`);
const run = await fetchEach(pages, async (url) => parseCatalogCourses(await get(url)).map((c) => ({ ...c, source: url })), { attempts: 3, pause });
if (run.failed.length > 0) {
  for (const f of run.failed) console.error(`  ${f.key}: ${f.message}`);
  console.error(`${run.failed.length} pages failed; .cache/catalog-courses.json was not written.`);
  process.exit(1);
}
// fetchEach already flattens each page's courses into one list.
const courses = run.items;
mkdirSync(".cache", { recursive: true });
writeFileSync(".cache/catalog-courses.json", JSON.stringify({ fetchedAt: new Date().toISOString(), courses }));
console.log(`Saved ${courses.length} catalog courses`);

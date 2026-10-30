// The calendar feed's response: validate the query, look the sections up in the pre-built snapshot
// (via `loadDept`, so tests can pass a fixture) and render them with buildIcs.

import type { DepartmentSections } from "@turboterp/course-data/schedule-files";
import type { Section } from "@turboterp/course-data/schedules";
import { parseFeedQuery } from "./calendar-feed";
import { buildIcs } from "./ics";

export type LoadDept = (term: string, dept: string) => Promise<DepartmentSections | null>;

// Same URL = same calendar, so CDNs can serve repeats; calendar apps re-poll, and seat data isn't in the feed.
const CACHE = "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400";

const error = (message: string, status: number) =>
  Response.json({ error: message }, { status, headers: { "Cache-Control": status === 400 ? "public, max-age=3600" : "public, max-age=60" } });

export async function feedResponse(term: string | null, s: string | null, loadDept: LoadDept): Promise<Response> {
  const q = parseFeedQuery(term, s);
  if (!q.ok) return error(q.error, 400);

  const depts = [...new Set(q.pairs.map((p) => p.courseId.slice(0, 4)))];
  const loaded = new Map(await Promise.all(depts.map(async (d) => [d, await loadDept(q.term, d)] as const)));
  const sections: Section[] = [];
  for (const p of q.pairs) {
    const found = loaded.get(p.courseId.slice(0, 4))?.sections.find((x) => x.courseId === p.courseId && x.id === p.sectionId);
    if (!found) return error(`Section ${p.courseId}-${p.sectionId} not found`, 404);
    sections.push(found);
  }
  return new Response(buildIcs(q.term, sections), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="turboterp-${q.term}.ics"`,
      "Cache-Control": CACHE,
    },
  });
}

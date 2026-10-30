// The sections the schedule saved on this device picked for today, fetched from the section
// files. Used by Today's next-class hero; nothing leaves the device but the department fetches.

import { decodeDepartmentSections } from "@turboterp/course-data/schedule-files";
import type { Section } from "@turboterp/course-data/schedules";
import { pickedForToday } from "./leave-by";
import { parseSaved, SAVED_KEY } from "./saved";

/**
 * Sections the saved schedule picked, or null when there is no saved schedule or `inSession`
 * says its term's classes aren't meeting now (a Spring schedule saved during the fall).
 */
export async function loadPickedSections(inSession: (term: string) => boolean = () => true): Promise<Section[] | null> {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(SAVED_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  const term = (JSON.parse(raw) as { term?: unknown }).term;
  if (typeof term !== "string" || !inSession(term)) return null;
  const picks = pickedForToday(parseSaved(raw, term));
  const depts = [...new Set(Object.keys(picks).map((c) => c.slice(0, 4)))];
  if (depts.length === 0) return null;
  const files = await Promise.all(
    depts.map((d) =>
      fetch(`/api/schedule/${term}/sections/${d}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => (j ? decodeDepartmentSections(j).sections : []))
        .catch(() => [] as Section[]),
    ),
  );
  return files.flat().filter((s) => picks[s.courseId] === s.id);
}

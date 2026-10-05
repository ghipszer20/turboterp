// URL path → snapshot key for the schedule builder's data (packages/course-data/SCHEDULE_FILES.md).
// Strict patterns, so a bad URL is a 404 and never reaches the store.

export type DataKey = { key: string; /** seconds a CDN may serve it without revalidating */ maxAge: number };

const TERM = /^\d{6}$/;
const DEPT = /^[A-Z]{4}$/;

export function scheduleDataKey(parts: readonly string[]): DataKey | null {
  if (parts.length === 1 && parts[0] === "current") return { key: "schedule/current", maxAge: 300 };
  const [term, kind, dept] = parts;
  if (!term || !TERM.test(term)) return null;
  if (parts.length === 2 && kind === "index") return { key: `schedule/${term}/index`, maxAge: 3600 };
  if (parts.length === 3 && dept && DEPT.test(dept)) {
    if (kind === "sections") return { key: `schedule/${term}/sections/${dept}`, maxAge: 120 };
    if (kind === "grades") return { key: `schedule/${term}/grades/${dept}`, maxAge: 86400 };
  }
  return null;
}

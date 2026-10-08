// A few plain lines describing one copy of a document, for the "which copy?" cards.
import type { DocKind } from "./decide";

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export type CopySummary = { lines: string[] };

export function summarize(kind: DocKind, raw: string | null): CopySummary {
  if (!raw) return { lines: [] };
  try {
    const d = JSON.parse(raw) as Record<string, unknown>;
    if (kind === "plan") {
      const programs = Array.isArray(d.programs) ? d.programs.filter((p): p is string => typeof p === "string") : [];
      const terms = Array.isArray(d.terms) ? d.terms.length : 0;
      return { lines: [...(programs.length ? [`Programs: ${programs.join(", ")}`] : []), plural(terms, "term")] };
    }
    if (kind === "schedule") {
      const courses = Array.isArray(d.courses) ? d.courses.length : 0;
      return { lines: [...(typeof d.term === "string" ? [`Term ${d.term}`] : []), plural(courses, "course")] };
    }
    return { lines: [plural(Object.keys(d).length, "term")] };
  } catch {
    return { lines: [] };
  }
}

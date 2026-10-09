// A few plain lines describing one copy of a document, for the "replace the saved copy?" dialog.
import { termFromMatriculationId } from "../advisor/terms";
import type { DocKind } from "./decide";

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export type CopySummary = { lines: string[] };

/** `nameOf` turns a program id into its name (the chooser loads the registry only when it opens). */
export function summarize(kind: DocKind, raw: string | null, nameOf: (id: string) => string = (id) => id): CopySummary {
  if (!raw) return { lines: [] };
  try {
    const d = JSON.parse(raw) as Record<string, unknown>;
    if (kind === "plan") {
      const programs = Array.isArray(d.programs) ? d.programs.filter((p): p is string => typeof p === "string") : [];
      const terms = Array.isArray(d.terms) ? d.terms.length : 0;
      return { lines: [...(programs.length ? [programs.map(nameOf).join(", ")] : []), plural(terms, "term")] };
    }
    if (kind === "schedule") {
      const courses = Array.isArray(d.courses) ? d.courses.length : 0;
      return { lines: [...(typeof d.term === "string" ? [termFromMatriculationId(d.term) ?? d.term] : []), plural(courses, "course")] };
    }
    return { lines: [plural(Object.keys(d).length, "term")] };
  } catch {
    return { lines: [] };
  }
}

// Program limits shown as warnings in the schedule builder. Warn only: restricted sections stay
// selectable and stay in generated layouts. Classification lives in course-data's programRestriction.

import type { Section } from "@turboterp/course-data/schedules";
import { programRestriction, type ProgramRestriction } from "@turboterp/course-data/program-restriction";

export type Restriction = ProgramRestriction;

/** The program limit on a section: its own note first, then the course's restriction, then the section number. */
export function sectionRestriction(section: Section, courseRestriction: string | null): Restriction | null {
  return (
    programRestriction(section.notes, section.id) ??
    programRestriction(courseRestriction, section.id)
  );
}

/** A course-level limit only (no section number fallback): drives the chip warning. */
export function courseRestrictionOf(courseRestriction: string | null): Restriction | null {
  return programRestriction(courseRestriction);
}

const who = (r: Restriction) => (r.program ? r.program : "a special program");

/** "Only for students in Science in the Evening" */
export const restrictionNote = (r: Restriction): string => `Only for students in ${who(r)}`;

/** "BSCI160 SES1 is only for students in Science in the Evening." */
export const restrictionLine = (courseId: string, sectionId: string, r: Restriction): string =>
  `${courseId} ${sectionId} is only for students in ${who(r)}.`;

/** "CPBE101 is only for students in College Park Scholars." */
export const courseRestrictionLine = (courseId: string, r: Restriction): string =>
  `${courseId} is only for students in ${who(r)}.`;

export type LayoutRestriction = { courseId: string; sectionId: string; note: string };

export function layoutRestrictions(
  sections: readonly Section[],
  courseRestrictions: Readonly<Record<string, string | null | undefined>>,
): LayoutRestriction[] {
  const out: LayoutRestriction[] = [];
  for (const s of sections) {
    const r = sectionRestriction(s, courseRestrictions[s.courseId] ?? null);
    if (r) out.push({ courseId: s.courseId, sectionId: s.id, note: restrictionNote(r) });
  }
  return out;
}

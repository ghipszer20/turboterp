// The frequent seat refresh writes one whole-term file, schedule/<term>/seats
// (packages/course-data/src/soc-refresh.ts); the department files only hold the nightly counts.
// The browser overlays the former onto the latter. Kept free of server-only imports.

import type { Section } from "@turboterp/course-data/schedules";

/** schedule/<term>/seats: [open, waitlist, holdfile, total] per "COURSEID-SECTIONID". */
export type SeatsFile = { v: number; term: string; generatedAt: string; seats: Record<string, [number, number, number, number]> };

export type SeatsOverlay = { generatedAt: string; seats: SeatsFile["seats"] };

/** Reads a fetched seats file; null when it isn't one this code understands. */
export function decodeSeats(data: unknown): SeatsOverlay | null {
  const f = data as Partial<SeatsFile> | null;
  if (!f || f.v !== 1 || typeof f.generatedAt !== "string" || typeof f.seats !== "object" || f.seats === null) return null;
  return { generatedAt: f.generatedAt, seats: f.seats };
}

/** The sections with their seat counts replaced from the seats file where it has the section. */
export function overlaySeats(sections: Section[], overlay: SeatsOverlay | null): Section[] {
  if (!overlay) return sections;
  return sections.map((s) => {
    const row = overlay.seats[`${s.courseId}-${s.id}`];
    if (!row) return s;
    const [open, waitlist, holdfile, total] = row;
    return { ...s, seats: { total, open, waitlist, holdfile } };
  });
}

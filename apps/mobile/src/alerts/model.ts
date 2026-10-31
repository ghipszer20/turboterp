// View models for the Seat Alerts screens.
import type { Section } from "@turboterp/course-data/schedules";
import { findWatch, type WatchRow } from "@turboterp/app-core/seat-alerts/view";

export type SectionAction = "open" | "watching" | "notify";

/** Open sections link to Testudo, watched ones say so, full ones offer "Notify me". */
export function sectionAction(s: Pick<Section, "id" | "courseId" | "seats">, watches: readonly WatchRow[]): SectionAction {
  if (s.seats.open > 0) return "open";
  return findWatch(watches, s.courseId, s.id) ? "watching" : "notify";
}

/** The course-level button shows only while a section is full. */
export const showAllSections = (sections: readonly Pick<Section, "seats">[]): boolean => sections.some((s) => s.seats.open === 0);

export const ADD_ERRORS: Record<string, string> = {
  "open-now": "That section has seats right now. Register on Testudo.",
  limit: "You're watching 20 already. Remove one to add another.",
};
export const addErrorText = (code: string): string => ADD_ERRORS[code] ?? "Couldn't add that watch. Try again.";

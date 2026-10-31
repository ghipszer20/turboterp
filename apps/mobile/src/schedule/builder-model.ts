// View-model for the schedule builder: gallery sort choices, the Plan A/B/C rules, the save
// guard for overlaps and the section panel rows. Storage and rules come from app-core
// (`schedule/saved`, `schedule/conflicts`, `schedule/sections`), the same code the web uses.
import type { Section, Weekday } from "@turboterp/course-data/schedules";
import type { SortKey } from "@turboterp/course-data/sort";
import { setWindow, type FilterState } from "@turboterp/app-core/schedule/filters";
import { overlapNote, saveBlockedBy } from "@turboterp/app-core/schedule/conflicts";
import { bestRating, meetingSummary, overlapsWith, sectionKey } from "@turboterp/app-core/schedule/sections";
import { lastSavedPlan, PLAN_IDS, savePlan, type PlanId, type SavedSchedule, type SectionPicks } from "@turboterp/app-core/schedule/saved";

export type GallerySort = "default" | "rating" | "gpa" | "timing";

export const GALLERY_SORTS: { value: GallerySort; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "rating", label: "Rating" },
  { value: "gpa", label: "GPA" },
  { value: "timing", label: "Timing" },
];

/**
 * What the generator needs for a gallery sort. Default is the web's weighted "best" (30% rating,
 * 30% GPA, 40% timing). Rating and GPA reuse the web's "Best Teachers" ranking with the other
 * half left neutral, so each ranks on its own. Timing is the most condensed week (fewest gaps).
 */
export function sortRequest(
  sort: GallerySort,
  ratings: Record<string, number>,
  gpas: Record<string, number>,
): { sort: SortKey; ratings: Record<string, number>; gpas?: Record<string, number> } {
  switch (sort) {
    case "rating":
      return { sort: "recommended", ratings, gpas: {} };
    case "gpa":
      return { sort: "recommended", ratings: {}, gpas };
    case "timing":
      return { sort: "fewestGaps", ratings };
    default:
      return { sort: "best", ratings };
  }
}

/** The GPA sort needs the grade files (the web loads them only for its GPA-based sort too). */
export const sortNeedsGrades = (sort: GallerySort) => sort === "gpa";

// ---- Plans A/B/C ----

/** A saved plan only counts for courses still in the term, so a dropped course leaves no phantom plan. */
export const planHasPicks = (s: SavedSchedule, courses: string[], p: PlanId) =>
  Object.keys(s.plans[p] ?? {}).some((c) => courses.includes(c));

export type PlanChip = { id: PlanId; saved: boolean; /** only the last saved plan can be deleted */ removable: boolean };

export function planChips(s: SavedSchedule, courses: string[]): PlanChip[] {
  const has = (p: PlanId) => planHasPicks(s, courses, p);
  const last = lastSavedPlan(s, has);
  return PLAN_IDS.map((id) => ({ id, saved: has(id), removable: id === last }));
}

/** Two-tap delete: the first tap shows this question (owner wording, 2026-10-04). */
export const removeQuestion = (p: PlanId) => `Are you sure you want to delete Plan ${p}?`;

/** The plan to show after deleting `removed`: the one before it, or Build my own when it was Plan A. */
export const planAfterRemove = (removed: PlanId): PlanId | "own" => PLAN_IDS[PLAN_IDS.indexOf(removed) - 1] ?? "own";

export const savedNote = (p: PlanId) => `Saved as Plan ${p}`;

/** Picks (course -> section id) restricted to sections that still exist and courses still in the term. */
export function validPicks(picks: SectionPicks, courses: string[], byKey: ReadonlyMap<string, Section>): SectionPicks {
  return Object.fromEntries(Object.entries(picks).filter(([c, id]) => courses.includes(c) && byKey.has(`${c}/${id}`)));
}

export function picksToSections(picks: SectionPicks, courses: string[], byKey: ReadonlyMap<string, Section>): Record<string, Section> {
  const out: Record<string, Section> = {};
  for (const [c, id] of Object.entries(validPicks(picks, courses, byKey))) out[c] = byKey.get(`${c}/${id}`)!;
  return out;
}

export const picksToIds = (picks: Readonly<Record<string, Section>>): SectionPicks =>
  Object.fromEntries(Object.entries(picks).map(([c, s]) => [c, s.id]));

export type SaveCheck = { canSave: boolean; /** why saving is blocked, in the web's wording */ blockedNote: string | null };

/** Saving as a Plan is blocked while two picked sections overlap (owner) and when nothing is picked. */
export function saveCheck(picks: Readonly<Record<string, Section>>): SaveCheck {
  const sections = Object.values(picks);
  const pairs = saveBlockedBy(sections);
  return { canSave: sections.length > 0 && pairs.length === 0, blockedNote: pairs.length ? overlapNote(pairs) : null };
}

/** Saves picks as `plan`; the caller shows `savedNote(plan)`. */
export function saveAsPlan(s: SavedSchedule, plan: PlanId, picks: Readonly<Record<string, Section>>): SavedSchedule {
  return savePlan(s, plan, picksToIds(picks));
}

// ---- Section panel rows ----

export type SectionRow = {
  id: string;
  instructors: string;
  rating: number | undefined;
  seats: string;
  lowSeats: boolean;
  when: string;
  rooms: string;
  /** Other placed courses this section would overlap (Build my own). */
  clash: string[];
};

export function sectionRow(s: Section, ratings: Readonly<Record<string, number>>, placed: Section[]): SectionRow {
  const rooms = [...new Set(s.meetings.map((m) => [m.building, m.room].filter(Boolean).join(" ")).filter(Boolean))].join(", ");
  return {
    id: s.id,
    instructors: s.instructors.length ? s.instructors.join(" & ") : "TBA",
    rating: bestRating(s, ratings),
    seats: `${s.seats.open} open`,
    lowSeats: s.seats.open <= 5,
    when: meetingSummary(s),
    rooms,
    clash: overlapsWith(s, placed),
  };
}

// ---- Day filters (workday windows) ----

/** Hours a workday window can use: 7am to 10pm (same as the web's pickers). */
export const WINDOW_FIRST = 7 * 60;
export const WINDOW_LAST = 22 * 60;

/** Moves one end of a day's window by whole hours, keeping at least an hour inside it. */
export function stepWindow(filters: FilterState, day: Weekday, edge: "from" | "to", hours: number): FilterState {
  const rule = filters.days[day];
  const from = rule && rule !== "off" ? rule.from : WINDOW_FIRST;
  const to = rule && rule !== "off" ? rule.to : WINDOW_LAST;
  if (edge === "from") {
    const t = Math.min(Math.max(from + hours * 60, WINDOW_FIRST), WINDOW_LAST - 60);
    return setWindow(filters, day, t, Math.max(to, t + 60));
  }
  const t = Math.min(Math.max(to + hours * 60, WINDOW_FIRST + 60), WINDOW_LAST);
  return setWindow(filters, day, Math.min(from, t - 60), t);
}

export const indexSections =(sections: Section[]) => new Map(sections.map((s) => [sectionKey(s), s]));

export function groupByCourse(sections: Section[]): Map<string, Section[]> {
  const m = new Map<string, Section[]>();
  for (const s of sections) m.set(s.courseId, [...(m.get(s.courseId) ?? []), s]);
  return m;
}

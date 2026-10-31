// View models for the course and professor screens and the Advisor's course sheet. Pure (no React).
import type { Section } from "@turboterp/course-data/schedules";
import { gradeBars, gradeSummary, termSpan } from "@turboterp/app-core/grades";
import { reviewsView } from "@turboterp/app-core/schedule/instructor-reviews";
import { courseRestrictionOf, restrictionNote } from "@turboterp/app-core/schedule/restrictions";
import { overlaySeats, type SeatsOverlay } from "@turboterp/app-core/schedule/seats-overlay";
import { bestRating, meetingSummary } from "@turboterp/app-core/schedule/sections";
import type { CourseGrades, Distribution, ReviewSummary } from "@turboterp/ratings";

export const COURSE_CODE = /\b[A-Z]{4}\d{3}[A-Z]?\b/g;

export type TextPart = { text: string; code: string | null };

/** Splits as-printed requirement text so each course code can be a tappable link. */
export function splitCourseCodes(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let at = 0;
  for (const m of text.matchAll(COURSE_CODE)) {
    if (m.index > at) parts.push({ text: text.slice(at, m.index), code: null });
    parts.push({ text: m[0], code: m[0] });
    at = m.index + m[0].length;
  }
  if (at < text.length) parts.push({ text: text.slice(at), code: null });
  return parts;
}

export const deptOf = (courseId: string) => courseId.replace(/\d.*$/, "");

export const ratingLabel = (r: number | undefined | null) => (r === undefined || r === null ? "N/A" : `${r.toFixed(1)}★`);

export type GradeChartView = {
  bars: { label: string; percent: number; height: number }[];
  gpa: string | null;
  students: string;
  span: string;
};

export function gradeChartView(d: Distribution | null | undefined): GradeChartView | null {
  if (!d || d.students <= 0) return null;
  const s = gradeSummary(d);
  return {
    bars: gradeBars(d).map((b) => ({ label: b.label, percent: Math.round(b.share * 100), height: b.height })),
    gpa: s.gpa,
    students: s.students,
    span: termSpan(d.terms),
  };
}

export type SectionView = {
  id: string;
  instructors: string[];
  instructorLabel: string;
  rating: number | undefined;
  seats: string;
  full: boolean;
  lowSeats: boolean;
  meetings: { when: string; place: string }[];
  delivery: string;
};

/** Sections for the course screen: the live seat overlay applied, sorted by section id. */
export function sectionViews(
  sections: Section[],
  ratings: Readonly<Record<string, number>>,
  overlay: SeatsOverlay | null,
): SectionView[] {
  return overlaySeats(sections, overlay)
    .map((s): SectionView => {
      const open = s.seats.open;
      return {
        id: s.id,
        instructors: s.instructors,
        instructorLabel: s.instructors.length ? s.instructors.join(" & ") : "TBA",
        rating: bestRating(s, ratings),
        seats: open === 0 ? `Full (${s.seats.total})` : `${open} of ${s.seats.total} open`,
        full: open === 0,
        lowSeats: open > 0 && open <= 5,
        meetings: s.meetings.length
          ? s.meetings.map((m) => ({
              when: meetingSummary({ ...s, meetings: [m] }),
              place: [m.building, m.room].filter(Boolean).join(" "),
            }))
          : [{ when: meetingSummary(s), place: "" }],
        delivery: s.delivery,
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true }));
}

export type InstructorView = {
  name: string;
  rating: number | undefined;
  hasReviews: boolean;
  grade: GradeChartView | null;
};

/** One row per distinct instructor of the course's sections, with their grades in this course. */
export function instructorViews(
  sections: Section[],
  ratings: Readonly<Record<string, number>>,
  reviewNames: ReadonlySet<string>,
  grades: CourseGrades | null,
): InstructorView[] {
  const names = [...new Set(sections.flatMap((s) => s.instructors))].sort();
  return names.map((name) => ({
    name,
    rating: ratings[name],
    hasReviews: reviewNames.has(name),
    grade: gradeChartView(grades?.byProfessor[name]),
  }));
}

export type ReviewsView = {
  empty: boolean;
  rating: number | undefined;
  countLabel: string;
  rows: { stars: number; count: number; percent: number }[];
  courses: string[];
  excerpts: { rating: number; course: string | null; year: number; text: string }[];
  url: string;
};

export function reviewsSummaryView(s: ReviewSummary): ReviewsView {
  const v = reviewsView(s);
  return {
    empty: v.empty,
    rating: s.averageRating ?? undefined,
    countLabel: v.countLabel,
    rows: v.rows,
    courses: s.courses,
    excerpts: s.excerpts,
    url: v.profileUrl,
  };
}

/** The "Only for students in ..." line for a course restriction, or null when unrestricted. */
export function restrictionLine(restriction: string | null): string | null {
  const r = courseRestrictionOf(restriction);
  return r ? restrictionNote(r) : null;
}

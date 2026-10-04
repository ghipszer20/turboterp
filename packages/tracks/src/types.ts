// Shapes for pre-professional Tracks (CONTEXT.md: a Track lists what professional schools expect;
// it is never a UMD graduation requirement). SOURCES.md says where each track's data comes from.

import type { Requirement } from "@turboterp/audit";

/** One prerequisite category a professional school expects, such as HPAO's "8 Credits of Organic Chemistry with labs". */
export type TrackCategory = {
  /**
   * The UMD courses that satisfy it, in the audit's requirement format. The requirement's `id`
   * and `name` identify the category. Absent when TurboTerp can't name a UMD course yet (a
   * Manual Item the student confirms), e.g. medical terminology.
   */
  requirement?: Requirement;
  /** Used when `requirement` is absent. */
  id?: string;
  name?: string;
  /** The source's own wording, e.g. "8 Credits of Organic Chemistry with labs". */
  source: string;
  /** Milestone id of an admission test that covers this material, e.g. "mcat": finish it before that test. */
  examContent?: string;
  /**
   * How schools treat AP/IB credit here. "warn" (default): many schools don't accept it.
   * "accepted": the source says schools accept it (e.g. HPAO for calculus), so it's only noted.
   */
  examCredit?: "warn" | "accepted";
  /** Extra advice for a student whose AP/IB credit counts here, from the source. */
  examCreditAdvice?: string;
};

/** A date relative to the fall the student starts professional school (the entry year). */
export type RelativeDate = {
  /** Years from the entry year: -1 is the calendar year before it, when most students apply. */
  year: number;
  month: number;
  day?: number;
};

export type MilestoneKind = "exam" | "experience" | "letters" | "committee" | "application" | "advising" | "gpa";

/** Something that isn't a course: a test, hours of experience, letters, the application cycle. */
export type Milestone = {
  id: string;
  kind: MilestoneKind;
  name: string;
  /** Plain-language advice, for the student. */
  detail: string;
  /** When to begin (e.g. MCAT registration opens), if the source says. */
  start?: RelativeDate;
  /** The latest suggested date, if the source gives one. */
  due?: RelativeDate;
  /** Only some schools ask for it. */
  optional?: boolean;
  /** Hours of experience the source suggests, if it gives a number. */
  hours?: number;
};

/** When a student usually starts professional school. */
export type TrackEntry =
  /** After a bachelor's degree: the fall after the last planned term. */
  | { kind: "after-degree" }
  /** Transfer after `afterYears` years at UMD (e.g. pre-nursing's 2+2). */
  | { kind: "transfer"; afterYears: number };

export type SuggestedCourses = { area: string; courses: string[] };

export type Track = {
  id: string;
  name: string;
  /** Who reads the application, for messages: "medical schools". */
  schools: string;
  /** Lowest grade most schools accept in a prerequisite; below it the course doesn't count. */
  minGrade?: string;
  /** Wording used when a grade is below `minGrade`. */
  minGradeNote?: string;
  /** AP/IB credit is accepted for every category (e.g. the UMSON nursing pathway). */
  examCreditAccepted?: boolean;
  entry: TrackEntry;
  categories: TrackCategory[];
  milestones: Milestone[];
  /** Courses that build useful skills but aren't required (pre-law). */
  suggestedCourses?: SuggestedCourses[];
  /** Warn when a term's expected grades would lower the GPA (pre-law). */
  gpaProtection?: boolean;
  /**
   * Show the BCPM science GPA on this track's card. True for health tracks (BCPM is a health
   * professions admissions concept); pre-law omits it (owner ruling, 2026-09-27).
   */
  usesScienceGpa?: boolean;
  /** Shown with every result. */
  disclaimer: string;
  /** URLs this track was encoded from (all listed in SOURCES.md). */
  sources: string[];
  /** True only after the owner has reviewed and signed off. */
  verified: boolean;
  /** Interpretations the owner must check before verifying. */
  reviewNotes: string[];
};

export const HPAO_DISCLAIMER = "Confirm with HPAO and each target school.";

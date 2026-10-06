// The student's Plan as the Advisor tab stores it on this device: programs, terms with
// course-level entries (never sections, so the schedule builder can sync by course only), and the
// prior-credit form inputs (derived credit is recomputed, never stored).

import type { College } from "@turboterp/plan/credit-caps";
import type { GradCreditTag } from "@turboterp/plan/grad-courses";
import { defaultTerms, parseTerm, sortTerms } from "./terms";

export type PlannedCourse = {
  id: string;
  /** Overrides the catalog's credits, e.g. for a variable-credit course. */
  credits?: number;
  status?: "planned" | "completed";
  grade?: string;
  /** How a graduate course's credits count (@turboterp/plan/grad-courses); omitted (the default)
   * is "undergrad credit". Ignored by the checker for a non-graduate course. */
  gradTag?: GradCreditTag;
};

export type PlanTermState = { name: string; courses: PlannedCourse[] };

export type ApInput = { key: string; exam: string; score: number };
export type IbInput = { key: string; exam: string; level: "SL" | "HL"; score: number };
export type DualInput = {
  key: string;
  institution: string;
  course: string;
  credits: number;
  /** The UMD course it transfers as, e.g. "MATH140"; ignored when `elective` is set. */
  umd: string;
  /** Transfers as elective credit (no UMD course). */
  elective: boolean;
};

export type PriorInputs = {
  ap: ApInput[];
  ib: IbInput[];
  dual: DualInput[];
  /** The course picked for an award that offers a choice, keyed by the award's source label. */
  choices: Record<string, string>;
};

export type AdvisorPlan = {
  v: 1;
  /** Chosen program ids (majors), in the order chosen. */
  programs: string[];
  catalogYear: string;
  startTerm: string;
  terms: PlanTermState[];
  prior: PriorInputs;
  /**
   * The student's college, for the credit-cap check (packages/plan/src/credit-caps.ts). Chosen in
   * setup ("College" picker in SetupView), defaulting there to the first declared major's
   * college; omitted until setup sets it, so an older stored plan falls back to that same derived
   * default rather than needing a `v` bump.
   */
  college?: College;
  /**
   * How the student entered UMD. Omitted means a freshman; "transfer" skips the college intro
   * course requirement (packages/audit/programs/college-intro.ts).
   */
  entry?: "freshman" | "transfer";
  /**
   * With two majors: one degree with both (a double major) or two degrees (a double degree),
   * chosen in setup. Omitted means a double major (see degreeModeOf in programs.ts).
   */
  degreeMode?: DegreeChoice;
  /** Cumulative UMD GPA, for the CS gateway check. */
  gpa?: number;
  /** Chosen pre-professional track ids (@turboterp/tracks), never degree requirements. Omitted when empty. */
  tracks?: string[];
  /**
   * Planned term for an exam-content milestone, by the milestone's id (e.g. "mcat"): shared by
   * every chosen track whose categories point at it (pre-med and pre-podiatry both use "mcat").
   * Omitted when empty.
   */
  examTerms?: Record<string, string>;
  /**
   * Expected grades for not-yet-completed courses, by term name then course id, used only for a
   * gpaProtection track (pre-law). Kept separate from a course's own `grade`, which is a
   * transcript grade for a completed course. Omitted when empty.
   */
  expectedGrades?: Record<string, Record<string, string>>;
  /**
   * The combined BS/MS program's total master's credits, for the double-count cap
   * (@turboterp/plan/grad-courses: 35% of this number). Optional; omitted shows an info note
   * instead of checking the cap.
   */
  mastersCredits?: number;
  /**
   * Open Slots ("from an approved list" that isn't published) the student ticked as confirmed with
   * their advisor, as "<programId>/<requirementId>" (@turboterp/audit slotKey). Omitted when empty.
   */
  confirmedSlots?: string[];
};

export type PlanAction =
  | {
      type: "setup";
      programs: string[];
      catalogYear: string;
      startTerm: string;
      tracks: string[];
      examTerms: Record<string, string>;
      expectedGrades: Record<string, Record<string, string>>;
      /** Omitted: leaves the plan's existing college untouched (older callers/tests don't set one). */
      college?: College;
      /** Omitted: leaves the plan's existing choice untouched. */
      degreeMode?: DegreeChoice;
      /** Omitted: leaves the plan's existing entry untouched; "freshman" clears it. */
      entry?: "freshman" | "transfer";
    }
  | { type: "add-course"; term: string; id: string; credits?: number }
  | { type: "remove-course"; term: string; id: string }
  | { type: "move-course"; id: string; from: string; to: string; index?: number }
  | { type: "add-term"; name: string }
  | { type: "remove-term"; name: string }
  /** Marks a course completed (with a grade) or back to planned, from the course sheet. */
  | { type: "set-course"; term: string; id: string; status?: "planned" | "completed"; grade?: string }
  /** Sets a graduate course's credit tag from the course sheet; undefined resets it to "undergrad credit". */
  | { type: "set-grad-tag"; term: string; id: string; gradTag?: GradCreditTag }
  /** Sets or clears the combined BS/MS program's total master's credits. */
  | { type: "set-masters-credits"; mastersCredits: number | undefined }
  /** Course-level sync from the schedule builder, only ever dispatched from an explicit, student-confirmed "Update plan" click. */
  | { type: "set-term-courses"; term: string; ids: string[] }
  | { type: "set-prior"; prior: PriorInputs }
  | { type: "set-gpa"; gpa: number | undefined }
  /** Applying a what-if comparison: replaces only the declared majors, never tracks, exam terms
   * or anything else "setup" also touches. */
  | { type: "set-programs"; programs: string[] }
  /** Ticks or unticks an Open Slot as confirmed with the student's advisor. */
  | { type: "toggle-slot"; key: string };

export type DegreeChoice = "double-major" | "double-degree";
export const DEGREE_CHOICES: DegreeChoice[] = ["double-major", "double-degree"];

export const emptyPrior = (): PriorInputs => ({ ap: [], ib: [], dual: [], choices: {} });

/** A credit value a UMD course can carry: a whole or half credit from 0 to 20. A transcript GPA ("3.606") is not one. */
export function isCreditValue(n: number): boolean {
  return Number.isFinite(n) && n >= 0 && n <= 20 && Number.isInteger(n * 2);
}

export function newPlan(setup: {
  programs: string[];
  catalogYear: string;
  startTerm: string;
  tracks?: string[];
  examTerms?: Record<string, string>;
  college?: College;
  degreeMode?: DegreeChoice;
}): AdvisorPlan {
  return {
    v: 1,
    programs: setup.programs,
    catalogYear: setup.catalogYear,
    startTerm: setup.startTerm,
    terms: defaultTerms(setup.startTerm).map((name) => ({ name, courses: [] })),
    prior: emptyPrior(),
    ...(setup.tracks?.length ? { tracks: setup.tracks } : {}),
    ...(setup.examTerms && Object.keys(setup.examTerms).length ? { examTerms: setup.examTerms } : {}),
    ...(setup.college ? { college: setup.college } : {}),
    ...(setup.degreeMode ? { degreeMode: setup.degreeMode } : {}),
  };
}

export const termCourseIds = (plan: AdvisorPlan, term: string) => plan.terms.find((t) => t.name === term)?.courses.map((c) => c.id) ?? [];

const normalizeId = (id: string) => id.replace(/\s+/g, "").toUpperCase();
const isMain = (name: string) => {
  const season = parseTerm(name)?.season;
  return season === "Fall" || season === "Spring";
};

function mapTerm(plan: AdvisorPlan, name: string, f: (t: PlanTermState) => PlanTermState): AdvisorPlan {
  return { ...plan, terms: plan.terms.map((t) => (t.name === name ? f(t) : t)) };
}

/** Moves the whole plan to a new start term, keeping each course's place in the fall/spring sequence. */
function restart(plan: AdvisorPlan, startTerm: string): AdvisorPlan {
  const main: PlannedCourse[][] = [];
  const oldNames: string[][] = []; // old term name(s) each main bucket was built from
  for (const term of plan.terms) {
    if (isMain(term.name) || main.length === 0) {
      main.push([...term.courses]);
      oldNames.push([term.name]);
    } else {
      // A winter or summer term's courses (and name) join the term before it.
      main[main.length - 1]!.push(...term.courses.filter((c) => !main[main.length - 1]!.some((x) => x.id === c.id)));
      oldNames[oldNames.length - 1]!.push(term.name);
    }
  }
  const names = defaultTerms(startTerm, Math.max(8, main.length));
  const rename = new Map<string, string>();
  oldNames.forEach((olds, i) => olds.forEach((old) => rename.set(old, names[i]!)));

  const next: AdvisorPlan = { ...plan, startTerm, terms: names.map((name, i) => ({ name, courses: main[i] ?? [] })) };
  if (plan.examTerms) {
    const examTerms: Record<string, string> = {};
    for (const [milestone, term] of Object.entries(plan.examTerms)) {
      const renamed = rename.get(term);
      if (renamed) examTerms[milestone] = renamed;
    }
    if (Object.keys(examTerms).length) next.examTerms = examTerms;
    else delete next.examTerms;
  }
  if (plan.expectedGrades) {
    const expectedGrades: Record<string, Record<string, string>> = {};
    for (const [term, grades] of Object.entries(plan.expectedGrades)) {
      const renamed = rename.get(term);
      if (renamed) expectedGrades[renamed] = { ...expectedGrades[renamed], ...grades };
    }
    if (Object.keys(expectedGrades).length) next.expectedGrades = expectedGrades;
    else delete next.expectedGrades;
  }
  return next;
}

export function planReducer(plan: AdvisorPlan, action: PlanAction): AdvisorPlan {
  switch (action.type) {
    case "setup": {
      const next: AdvisorPlan = { ...plan, programs: action.programs, catalogYear: action.catalogYear };
      if (action.college !== undefined) next.college = action.college;
      if (action.degreeMode !== undefined) next.degreeMode = action.degreeMode;
      if (action.entry === "transfer") next.entry = "transfer";
      else if (action.entry === "freshman") delete next.entry;
      if (action.tracks.length) next.tracks = action.tracks;
      else delete next.tracks;
      if (Object.keys(action.examTerms).length) next.examTerms = action.examTerms;
      else delete next.examTerms;
      if (Object.keys(action.expectedGrades).length) next.expectedGrades = action.expectedGrades;
      else delete next.expectedGrades;
      return action.startTerm === plan.startTerm || !parseTerm(action.startTerm) ? next : restart(next, action.startTerm);
    }
    case "add-course": {
      const id = normalizeId(action.id);
      const term = plan.terms.find((t) => t.name === action.term);
      if (!id || !term || term.courses.some((c) => c.id === id)) return plan;
      const course: PlannedCourse = action.credits === undefined ? { id } : { id, credits: action.credits };
      return mapTerm(plan, action.term, (t) => ({ ...t, courses: [...t.courses, course] }));
    }
    case "remove-course":
      return mapTerm(plan, action.term, (t) => ({ ...t, courses: t.courses.filter((c) => c.id !== action.id) }));
    case "set-course": {
      const term = plan.terms.find((t) => t.name === action.term);
      if (!term || !term.courses.some((c) => c.id === action.id)) return plan;
      return mapTerm(plan, action.term, (t) => ({
        ...t,
        courses: t.courses.map((c): PlannedCourse => {
          if (c.id !== action.id) return c;
          const next = { ...c };
          if (action.status === undefined) delete next.status;
          else next.status = action.status;
          if (action.grade === undefined) delete next.grade;
          else next.grade = action.grade;
          return next;
        }),
      }));
    }
    case "set-grad-tag": {
      const term = plan.terms.find((t) => t.name === action.term);
      if (!term || !term.courses.some((c) => c.id === action.id)) return plan;
      return mapTerm(plan, action.term, (t) => ({
        ...t,
        courses: t.courses.map((c): PlannedCourse => {
          if (c.id !== action.id) return c;
          const next = { ...c };
          if (action.gradTag === undefined) delete next.gradTag;
          else next.gradTag = action.gradTag;
          return next;
        }),
      }));
    }
    case "move-course": {
      const from = plan.terms.find((t) => t.name === action.from);
      const to = plan.terms.find((t) => t.name === action.to);
      const course = from?.courses.find((c) => c.id === action.id);
      if (!from || !to || !course) return plan;
      if (from !== to && to.courses.some((c) => c.id === action.id)) return plan;
      const place = (list: PlannedCourse[]) => {
        const rest = list.filter((c) => c.id !== action.id);
        const at = action.index === undefined ? rest.length : Math.max(0, Math.min(action.index, rest.length));
        return [...rest.slice(0, at), course, ...rest.slice(at)];
      };
      return {
        ...plan,
        terms: plan.terms.map((t) => {
          if (t === to) return { ...t, courses: place(t.courses) };
          if (t === from) return { ...t, courses: t.courses.filter((c) => c.id !== action.id) };
          return t;
        }),
      };
    }
    case "add-term": {
      if (!parseTerm(action.name) || plan.terms.some((t) => t.name === action.name)) return plan;
      const names = sortTerms([...plan.terms.map((t) => t.name), action.name]);
      return { ...plan, terms: names.map((name) => plan.terms.find((t) => t.name === name) ?? { name, courses: [] }) };
    }
    case "remove-term": {
      const next: AdvisorPlan = { ...plan, terms: plan.terms.filter((t) => t.name !== action.name) };
      if (next.expectedGrades && action.name in next.expectedGrades) {
        const expectedGrades = { ...next.expectedGrades };
        delete expectedGrades[action.name];
        if (Object.keys(expectedGrades).length) next.expectedGrades = expectedGrades;
        else delete next.expectedGrades;
      }
      return next;
    }
    case "set-term-courses": {
      const ids = [...new Set(action.ids.map(normalizeId).filter(Boolean))];
      const term = plan.terms.find((t) => t.name === action.term);
      if (!term) {
        // The schedule builder's term isn't a plan term yet (e.g. it's beyond the plan's
        // eight terms): create it in sorted order, the same place `add-term` would put it.
        if (!parseTerm(action.term)) return plan;
        const names = sortTerms([...plan.terms.map((t) => t.name), action.term]);
        const terms = names.map((name) =>
          name === action.term ? { name, courses: ids.map((id) => ({ id })) } : plan.terms.find((t) => t.name === name)!,
        );
        return { ...plan, terms };
      }
      const courses = ids.map((id) => term.courses.find((c) => c.id === id) ?? { id });
      // Same courses, same order: return the same plan so a no-op sync never triggers a save.
      const unchanged = courses.length === term.courses.length && courses.every((c, i) => c === term.courses[i]);
      return unchanged ? plan : mapTerm(plan, action.term, (t) => ({ ...t, courses }));
    }
    case "set-prior":
      return { ...plan, prior: action.prior };
    case "set-gpa": {
      const next = { ...plan };
      if (action.gpa === undefined) delete next.gpa;
      else next.gpa = action.gpa;
      return next;
    }
    case "set-programs":
      return { ...plan, programs: action.programs };
    case "set-masters-credits": {
      const next = { ...plan };
      if (action.mastersCredits === undefined) delete next.mastersCredits;
      else next.mastersCredits = action.mastersCredits;
      return next;
    }
    case "toggle-slot": {
      const had = plan.confirmedSlots ?? [];
      const slots = had.includes(action.key) ? had.filter((k) => k !== action.key) : [...had, action.key];
      const next = { ...plan };
      if (slots.length === 0) delete next.confirmedSlots;
      else next.confirmedSlots = slots;
      return next;
    }
  }
}

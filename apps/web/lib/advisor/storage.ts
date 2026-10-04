// The Plan in this device's localStorage. Loading validates everything and drops what it can't
// read, so a corrupt or older save never breaks the page.

// TRACKS comes from "@turboterp/tracks/list", which has no runtime @turboterp/audit import (no
// HiGHS), so validating a saved track id here doesn't pull the solver into the main bundle.
import { COLLEGES, type College } from "@turboterp/plan/credit-caps";
import { GRAD_CREDIT_TAGS, type GradCreditTag } from "@turboterp/plan/grad-courses";
import { TRACKS } from "@turboterp/tracks/list";
import { DEGREE_CHOICES, type AdvisorPlan, type ApInput, type DegreeChoice, type DualInput, type IbInput, type PlannedCourse, type PlanTermState, type PriorInputs } from "./plan-state";
import { parseTerm } from "./terms";

export const PLAN_STORAGE_KEY = "turboterp-advisor-plan";

export const serializePlan = (plan: AdvisorPlan) => JSON.stringify(plan);

type Obj = Record<string, unknown>;
const isObj = (x: unknown): x is Obj => typeof x === "object" && x !== null && !Array.isArray(x);
const str = (x: unknown): x is string => typeof x === "string";
const num = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x);
const list = (x: unknown): unknown[] => (Array.isArray(x) ? x : []);
const COURSE = /^[A-Z]{4}\d{3}[A-Z]?$/;

const KNOWN_GRAD_TAGS = new Set<string>(GRAD_CREDIT_TAGS);

function course(x: unknown): PlannedCourse | null {
  if (!isObj(x) || !str(x.id) || !COURSE.test(x.id)) return null;
  const out: PlannedCourse = { id: x.id };
  if (num(x.credits)) out.credits = x.credits;
  if (x.status === "planned" || x.status === "completed") out.status = x.status;
  if (str(x.grade)) out.grade = x.grade;
  if (str(x.gradTag) && KNOWN_GRAD_TAGS.has(x.gradTag)) out.gradTag = x.gradTag as GradCreditTag;
  return out;
}

function term(x: unknown): PlanTermState | null {
  if (!isObj(x) || !str(x.name) || !parseTerm(x.name)) return null;
  return { name: x.name, courses: list(x.courses).map(course).filter((c): c is PlannedCourse => c !== null) };
}

const score = (x: unknown, max: number): x is number => num(x) && Number.isInteger(x) && x >= 1 && x <= max;

function prior(x: unknown): PriorInputs {
  const p = isObj(x) ? x : {};
  const ap = list(p.ap).filter((a): a is ApInput => isObj(a) && str(a.key) && str(a.exam) && score(a.score, 5));
  const ib = list(p.ib).filter(
    (a): a is IbInput => isObj(a) && str(a.key) && str(a.exam) && (a.level === "SL" || a.level === "HL") && score(a.score, 7),
  );
  const dual = list(p.dual).filter(
    (a): a is DualInput =>
      isObj(a) && str(a.key) && str(a.institution) && str(a.course) && num(a.credits) && str(a.umd) && typeof a.elective === "boolean",
  );
  const choices: Record<string, string> = {};
  if (isObj(p.choices)) for (const [k, v] of Object.entries(p.choices)) if (str(v)) choices[k] = v;
  return { ap, ib, dual, choices };
}

const KNOWN_TRACK_IDS = new Set(TRACKS.map((t) => t.id));
const KNOWN_COLLEGES = new Set(COLLEGES.map((c) => c.code));
const college = (x: unknown): College | undefined => (str(x) && KNOWN_COLLEGES.has(x as College) ? (x as College) : undefined);

/** Chosen track ids, unknown ones dropped; undefined when none are left. */
function tracks(x: unknown): string[] | undefined {
  const ids = [...new Set(list(x).filter((v): v is string => str(v) && KNOWN_TRACK_IDS.has(v)))];
  return ids.length ? ids : undefined;
}

/** Milestone id -> term name, a malformed term name dropped; undefined when none are left. */
function examTerms(x: unknown): Record<string, string> | undefined {
  if (!isObj(x)) return undefined;
  const out: Record<string, string> = {};
  for (const [milestone, term] of Object.entries(x)) if (str(term) && parseTerm(term)) out[milestone] = term;
  return Object.keys(out).length ? out : undefined;
}

/** Term name -> course id -> grade, a malformed term or course id dropped; undefined when none are left. */
function expectedGrades(x: unknown): Record<string, Record<string, string>> | undefined {
  if (!isObj(x)) return undefined;
  const out: Record<string, Record<string, string>> = {};
  for (const [term, grades] of Object.entries(x)) {
    if (!parseTerm(term) || !isObj(grades)) continue;
    const g: Record<string, string> = {};
    for (const [id, grade] of Object.entries(grades)) if (COURSE.test(id) && str(grade)) g[id] = grade;
    if (Object.keys(g).length) out[term] = g;
  }
  return Object.keys(out).length ? out : undefined;
}

export function parsePlan(raw: string | null): AdvisorPlan | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isObj(data) || data.v !== 1 || !str(data.startTerm) || !parseTerm(data.startTerm) || !str(data.catalogYear)) return null;
  const terms = list(data.terms).map(term).filter((t): t is PlanTermState => t !== null);
  if (terms.length === 0) return null;
  const plan: AdvisorPlan = {
    v: 1,
    programs: list(data.programs).filter(str),
    catalogYear: data.catalogYear,
    startTerm: data.startTerm,
    terms,
    prior: prior(data.prior),
  };
  if (num(data.gpa)) plan.gpa = data.gpa;
  if (num(data.mastersCredits) && data.mastersCredits > 0) plan.mastersCredits = data.mastersCredits;
  const c = college(data.college);
  if (c) plan.college = c;
  if (DEGREE_CHOICES.includes(data.degreeMode as DegreeChoice)) plan.degreeMode = data.degreeMode as DegreeChoice;
  if (data.entry === "transfer") plan.entry = "transfer";
  const t = tracks(data.tracks);
  if (t) plan.tracks = t;
  const et = examTerms(data.examTerms);
  if (et) plan.examTerms = et;
  const eg = expectedGrades(data.expectedGrades);
  if (eg) plan.expectedGrades = eg;
  const slots = [...new Set(list(data.confirmedSlots).filter(str))];
  if (slots.length) plan.confirmedSlots = slots;
  return plan;
}

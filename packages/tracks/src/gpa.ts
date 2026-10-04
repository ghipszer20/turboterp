// GPA the way AMCAS computes it (SOURCES.md: AMCAS Course Classification Guide and Grade
// Conversion Guide). AACOMAS, AADSAS and most other health application services use the same
// BCPM idea, so one science GPA serves every health track.
//
// AMCAS classifies each course by its primary content; TurboTerp approximates that by UMD
// department, with a few per-course exceptions. The owner should confirm both tables.

export type GradedCourse = { id: string; credits: number; grade?: string };
export type BcpmCategory = "biology" | "chemistry" | "physics" | "math";
export type GpaSummary = {
  /** null when no graded course counts. */
  gpa: number | null;
  credits: number;
  qualityPoints: number;
  /** Courses left out of the GPA, and why. */
  excluded: { id: string; reason: string }[];
};
export type ScienceGpa = GpaSummary & { byCategory: Record<BcpmCategory, { credits: number; gpa: number | null }> };

/**
 * UMD department → AMCAS BCPM classification. Departments in the Spring 2027 Schedule of Classes
 * whose names match AMCAS's Biology, Chemistry, Physics or Mathematics examples:
 * - Biology: BSCI (Biological Sciences Program), BIOL (Biology), BISI (Biological Sciences),
 *   CBMG (Cell Biology & Molecular Genetics), ENTM (Entomology: AMCAS lists entomology),
 *   NEUR (Neuroscience), BIPH (Biophysics: AMCAS lists biophysics under Biology).
 * - Chemistry: CHEM, BCHM (AMCAS lists biochemistry under Chemistry).
 * - Physics: PHYS, ASTR (AMCAS lists astronomy under Physics).
 * - Math: MATH, STAT, AMSC (applied mathematics), BIOM (Biometrics = biostatistics).
 * Not BCPM: ANSC and other agriculture departments (AMCAS "Natural and Physical Sciences"),
 * NFSC, PLSC, BIOE (engineering), PSYC, EPIB, CMSC.
 */
export const BCPM_DEPARTMENTS: Record<string, BcpmCategory> = {
  BSCI: "biology",
  BIOL: "biology",
  BISI: "biology",
  CBMG: "biology",
  ENTM: "biology",
  NEUR: "biology",
  BIPH: "biology",
  CHEM: "chemistry",
  BCHM: "chemistry",
  PHYS: "physics",
  ASTR: "physics",
  MATH: "math",
  STAT: "math",
  AMSC: "math",
  BIOM: "math",
};

/** Courses whose content puts them in a BCPM category their department isn't in. */
export const BCPM_COURSES: Record<string, BcpmCategory> = {
  EPIB315: "math", // Biostatistics for Public Health Practice (AMCAS: biostatistics is math)
  PSYC200: "math", // Statistical Methods in Psychology (AMCAS: statistics is math)
  BIOE120: "biology", // Biology for Engineers (the BIOE curriculum counts it as BSCI105)
};

const COURSE_ID = /^([A-Z]{4})(\d{3})[A-Z]?$/;

export function bcpmCategory(id: string): BcpmCategory | null {
  const m = COURSE_ID.exec(id);
  if (!m) return null;
  return BCPM_COURSES[`${m[1]}${m[2]}`] ?? BCPM_DEPARTMENTS[m[1]!] ?? null;
}

/** AMCAS weights for a UMD letter grade (A+ converts to A). */
export const AMCAS_WEIGHTS: Record<string, number> = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  "D-": 0.7,
  F: 0.0,
};

const PASS_FAIL = new Set(["P", "S", "PASS", "NC", "U", "SAT"]);

/** Grade points for a letter grade, or why the course has none. */
function weigh(course: GradedCourse, weights: Record<string, number>): number | string {
  const grade = course.grade?.trim().toUpperCase();
  if (!grade) return "no grade (AP, IB or transfer credit)";
  if (PASS_FAIL.has(grade)) return `pass/fail grade ${grade}`;
  return weights[grade] ?? `grade ${grade} carries no grade points`;
}

/** GPA over the given courses. Every attempt of a repeated course counts, as AMCAS and LSAC count them. */
export function gpaOf(courses: GradedCourse[], weights: Record<string, number> = AMCAS_WEIGHTS): GpaSummary {
  let credits = 0;
  let qualityPoints = 0;
  const excluded: GpaSummary["excluded"] = [];
  for (const course of courses) {
    const w = weigh(course, weights);
    if (typeof w === "string") {
      excluded.push({ id: course.id, reason: w });
      continue;
    }
    credits += course.credits;
    qualityPoints += w * course.credits;
  }
  return { gpa: credits > 0 ? qualityPoints / credits : null, credits, qualityPoints, excluded };
}

/** Overall GPA on the AMCAS scale, over every graded course. */
export function amcasGpa(courses: GradedCourse[]): GpaSummary {
  return gpaOf(courses);
}

/** BCPM (science) GPA, AMCAS-style, with a GPA per category. */
export function scienceGpa(courses: GradedCourse[]): ScienceGpa {
  const science = courses.filter((c) => bcpmCategory(c.id) !== null);
  const part = (category: BcpmCategory) => {
    const { gpa, credits } = gpaOf(science.filter((c) => bcpmCategory(c.id) === category));
    return { credits, gpa };
  };
  return {
    ...gpaOf(science),
    byCategory: { biology: part("biology"), chemistry: part("chemistry"), physics: part("physics"), math: part("math") },
  };
}

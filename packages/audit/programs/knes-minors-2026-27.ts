// Kinesiology: Biomechanics and Motor Control Minor, Exercise Physiology Minor, and Sport, Commerce,
// & Culture Minor, 2026–27 UMD Academic Catalog (School of Public Health, Department of Kinesiology).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/public-health/kinesiology/
// kinesiology-biomechanics-motor-control-minor/, kinesiology-exercise-physiology-minor/, and
// kinesiology-sport-commerce-culture-minor/ (fetched 2026-09-28). Department page not checked.
// No official published sample plans (built from the requirements below; see
// docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta, Requirement } from "../src/audit.ts";

const SOURCE_KNES_MINORS =
  "UMD Academic Catalog 2026–27, Kinesiology minors (School of Public Health), " +
  "https://academiccatalog.umd.edu/undergraduate/colleges-schools/public-health/kinesiology/ (fetched 2026-09-28)";

const PHYSICAL_ACTIVITY: Requirement = {
  kind: "choose",
  id: "physical-activity",
  name: "Physical activity course (KNES1XX)",
  count: 1,
  from: { departments: ["KNES"], minNumber: 100, maxNumber: 199 },
};

const PA_NOTE =
  "'KNES1XX (Physical Activity Course), 1-2 credits' names no specific course; encoded as any one KNES course numbered 100-199 (the whole KNES 1XX range).";
const NO_DEPT_NOTE =
  "Department page not checked (encoded from the catalog only). The catalog states no minor GPA/grade minimum and no sharing cap with other programs; none is set.";

export const knesMinorBiomechanicsMotorControl: Program = {
  id: "knes-minor-biomechanics-motor-control",
  name: "Kinesiology: Biomechanics and Motor Control Minor",
  catalogYear: "2026-27",
  source: SOURCE_KNES_MINORS,
  verified: false,
  reviewNotes: [
    PA_NOTE,
    NO_DEPT_NOTE,
    "'Students are required to have BSCI170 and BSCI201 or PHYS121 (or equivalents) completed' is an entry prerequisite, not a minor requirement (no credit is listed for it in the table); not encoded, noted for manual check.",
    "'KNES498 Special Topics in Kinesiology (KNES498V Clinical Biomechanics: Musculoskeletal Injury)': only the named section KNES498V is accepted, not other KNES498 topics.",
  ],
  requirements: [
    PHYSICAL_ACTIVITY,
    {
      kind: "choose",
      id: "electives",
      name: "Choose five",
      count: 5,
      from: {
        courses: [
          "KNES226", "KNES265", "KNES300", "KNES306", "KNES350", "KNES370",
          "KNES385", "KNES402", "KNES462", "KNES474", "KNES498V",
        ],
      },
    },
  ],
};

export const knesMinorExercisePhysiology: Program = {
  id: "knes-minor-exercise-physiology",
  name: "Kinesiology: Exercise Physiology Minor",
  catalogYear: "2026-27",
  source: SOURCE_KNES_MINORS,
  verified: false,
  reviewNotes: [
    PA_NOTE,
    NO_DEPT_NOTE,
    "'At least nine credits must be at the 300 or 400 level' is an overlay over the listed 300/400-level courses (3 credits each assumed); it counts the same courses as the five electives.",
    "MATH113 (or eligibility for MATH120) is advised for prerequisites only; not encoded.",
    "'KNES289 Topical Investigations (KNES289F Foundations of Food, Physical Activity, & Health)': only the named section KNES289F is accepted.",
  ],
  requirements: [
    PHYSICAL_ACTIVITY,
    {
      kind: "choose",
      id: "electives",
      name: "Choose five",
      count: 5,
      from: {
        courses: [
          "KNES260", "KNES282", "KNES289F", "KNES320", "KNES332", "KNES350",
          "KNES360", "KNES445", "KNES460", "KNES464", "KNES465",
        ],
      },
    },
    {
      kind: "choose",
      id: "upper-level",
      name: "At least nine credits at the 300 or 400 level",
      credits: 9,
      overlay: true,
      from: {
        courses: ["KNES320", "KNES332", "KNES350", "KNES360", "KNES445", "KNES460", "KNES464", "KNES465"],
      },
    },
  ],
};

export const knesMinorSportCommerceCulture: Program = {
  id: "knes-minor-sport-commerce-culture",
  name: "Kinesiology: Sport, Commerce, & Culture Minor",
  catalogYear: "2026-27",
  source: SOURCE_KNES_MINORS,
  verified: false,
  reviewNotes: [
    PA_NOTE,
    NO_DEPT_NOTE,
    "'At least nine credits must be at the 300 or 400 level' is an overlay over the listed 300/400-level electives (3 credits each assumed).",
    "'KNES289 Topical Investigations (KNES289B Baseball: The National Pastime(?))': only the named section KNES289B is accepted; the catalog's own '(?)' suggests the section may be stale.",
  ],
  requirements: [
    PHYSICAL_ACTIVITY,
    { kind: "course", id: "knes287", name: "Sport and American Society", options: ["KNES287"] },
    {
      kind: "choose",
      id: "electives",
      name: "Choose four",
      count: 4,
      from: {
        courses: ["KNES225", "KNES285", "KNES289B", "KNES342", "KNES346", "KNES347", "KNES484", "KNES485"],
      },
    },
    {
      kind: "choose",
      id: "upper-level",
      name: "At least nine credits at the 300 or 400 level",
      credits: 9,
      overlay: true,
      from: { courses: ["KNES342", "KNES346", "KNES347", "KNES484", "KNES485"] },
    },
  ],
};

const KNES = "https://academiccatalog.umd.edu/undergraduate/colleges-schools/public-health/kinesiology/";

export const knesMinorBiomechanicsMotorControlMeta: ProgramMeta = { kind: "minor", college: "SPHL", short: "Biomechanics & Motor Control", sources: { catalog: KNES + "kinesiology-biomechanics-motor-control-minor/" } };

export const knesMinorExercisePhysiologyMeta: ProgramMeta = { kind: "minor", college: "SPHL", short: "Exercise Physiology", sources: { catalog: KNES + "kinesiology-exercise-physiology-minor/" } };

export const knesMinorSportCommerceCultureMeta: ProgramMeta = { kind: "minor", college: "SPHL", short: "Sport, Commerce, & Culture", sources: { catalog: KNES + "kinesiology-sport-commerce-culture-minor/" } };

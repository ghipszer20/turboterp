// The owner's test students (first-draft item 12): Advisor plans that exercise a real student
// situation each. Development-only, like seed.ts: /advisor?seed=student&id=<id> opens one, and
// lib/__tests__/advisor-test-students.test.ts checks each against the real analysis.
//
// Courses come from the courses fixture, the program files (packages/audit/programs) and the
// official/constructed sample plans (packages/programs/sample-plans); the terms below are those
// sample plans' terms. The catalog fixture is small, so every course carries its credits
// (CREDITS holds the sample plans' non-3-credit courses).

import { emptyPrior, type AdvisorPlan, type PlannedCourse } from "./plan-state";
import { defaultTerms } from "./terms";

/** The terms of packages/plan/test/fixtures/owner-plan.ts (Math Applied + CS). */
export const OWNER_TERMS: [string, string[]][] = [
  ["Fall 2026", ["CMSC131", "MATH240", "ENGL101", "CMNS100", "HIST200"]],
  ["Spring 2027", ["CMSC132", "MATH241", "COMM107", "PHIL140", "CHEM131", "CHEM132"]],
  ["Fall 2027", ["CMSC216", "CMSC250", "MATH246", "MATH310"]],
  ["Spring 2028", ["CMSC330", "CMSC351", "STAT410", "ARTH200", "AAAS100"]],
  ["Fall 2028", ["CMSC320", "MATH410", "MATH401", "AMSC460", "ECON200"]],
  ["Spring 2029", ["CMSC420", "CMSC335", "MATH411", "STAT401", "ENGL394"]],
  ["Fall 2029", ["CMSC414", "CMSC451", "MATH420", "MATH462", "PSYC100"]],
  ["Spring 2030", ["CMSC412", "CMSC421", "SOCY100", "ANTH260"]],
];

/** Credits of the courses that aren't 3 (from the sample plans' "credits" maps); the rest are 3. */
const CREDITS: Record<string, number> = {
  MATH140: 4, MATH141: 4, MATH240: 4, MATH241: 4, MATH135: 4, MATH136: 4, MATH206: 1,
  CMSC131: 4, CMSC132: 4, CMSC216: 4, CMSC250: 4, CMSC412: 4,
  PHYS171: 4, PHYS272: 4, PHYS273: 4, PHYS131: 4, PHYS132: 4,
  CHEM132: 1, CHEM232: 1, CHEM242: 1, CHEM271: 2, CHEM272: 2, CMNS100: 1, BSCI180: 1, BSCI222: 4, BSCI411: 4,
  BSCI160: 4, BSCI170: 4, ECON305: 4, ECON306: 4,
};

const course = (id: string, extra: Partial<PlannedCourse> = {}): PlannedCourse => ({ id, credits: CREDITS[id] ?? 3, ...extra });

type Spec = {
  programs: string[];
  startTerm: string;
  /** One list of course ids per term, from startTerm on. */
  terms: string[][];
  extra?: Partial<AdvisorPlan>;
  /** Marks terms[i] completed (with this grade) for i < completed. */
  completed?: { terms: number; grade: string };
};

function plan(s: Spec): AdvisorPlan {
  const names = defaultTerms(s.startTerm, s.terms.length);
  return {
    v: 1,
    programs: s.programs,
    catalogYear: "2026-27",
    startTerm: s.startTerm,
    terms: s.terms.map((ids, i) => ({
      name: names[i]!,
      courses: ids.map((id) => (s.completed && i < s.completed.terms ? course(id, { status: "completed", grade: s.completed.grade }) : course(id))),
    })),
    prior: emptyPrior(),
    ...s.extra,
  };
}

/** Terms i of every list merged, duplicate courses kept once. */
const merge = (...lists: string[][][]): string[][] =>
  Array.from({ length: Math.max(...lists.map((l) => l.length)) }, (_, i) => [...new Set(lists.flatMap((l) => l[i] ?? []))]);

// Sample plans (packages/programs/sample-plans), term by term.
const CMSC = [
  ["MATH140", "CMSC131"],
  ["MATH141", "CMSC132"],
  ["CMSC216", "CMSC250", "MATH240"],
  ["CMSC330", "CMSC351", "STAT400"],
  ["CMSC414", "CMSC420", "MATH310"],
  ["CMSC421", "CMSC320", "MATH401"],
  ["CMSC430", "CMSC335", "MATH406"],
  ["CMSC451", "MATH410"],
];
const BSCI_CEBG_FIRST_YEAR = [
  ["BSCI160", "CHEM131", "CHEM132", "MATH135", "CMNS100"],
  ["BSCI170", "BSCI180", "CHEM231", "CHEM232", "MATH136"],
];
const ECON_BA = [
  ["ECON200", "MATH120"],
  ["ECON201", "ECON230"],
  ["ECON305", "ECON310"],
  ["ECON306", "ECON311"],
  ["ECON312", "ECON414"],
  ["ECON410"],
  ["ECON412"],
  ["ECON416"],
];
const GVPT_BA = [
  ["GVPT170", "STAT100"],
  ["GVPT200"],
  ["GVPT241", "ECON200"],
  ["GVPT201", "GVPT280"],
  ["GVPT282", "GVPT320"],
  ["GVPT354", "GVPT356"],
  ["GVPT357", "GVPT377"],
  ["GVPT388"],
];
const ECON_MINOR = [["ECON200", "ECON201"], ["ECON305", "ECON306"], ["ECON410", "ECON422"]];

/** Electives (real courses from the owner plan) spread over terms to lift a double degree to 150 credits. */
const ELECTIVES = ["ENGL101", "UNIV100", "HIST200", "COMM107", "PHIL140", "CHEM131", "ARTH200", "AAAS100", "PSYC100", "SOCY100", "ANTH260", "ENGL394", "PHYS161"];
const spread = (base: string[][], extra: string[]): string[][] => base.map((t, i) => [...t, ...extra.filter((_, j) => j % base.length === i)]);

/** AP Calculus BC 5 (MATH140 and MATH141), as in the owner seed. */
const OWNER_PRIOR = { ...emptyPrior(), ap: [{ key: "seed-ap-1", exam: "Calculus BC", score: 5 }] };
const ownerIds = OWNER_TERMS.map(([, ids]) => ids);
const OWNER_EXTRA_TERMS = [
  ["PHYS171", "PHYS272", "MATH463", "STAT420"],
  ["PHYS273", "MATH206", "CMSC430", "MATH406"],
  ["ECON418A", "GVPT390"],
];

export const TEST_STUDENTS: { id: string; label: string; plan: AdvisorPlan }[] = [
  {
    id: "major-switch",
    label: "Major switch: two terms of Biological Sciences, then Computer Science",
    plan: plan({
      programs: ["cmsc-major"],
      startTerm: "Fall 2025",
      terms: [...BSCI_CEBG_FIRST_YEAR, ...CMSC],
      completed: { terms: 2, grade: "B" },
    }),
  },
  {
    id: "double-major",
    label: "Double major: Economics (BA) + Government and Politics (BA)",
    plan: plan({ programs: ["econ-major-ba", "gvpt-major-ba"], startTerm: "Fall 2026", terms: merge(ECON_BA, GVPT_BA) }),
  },
  {
    id: "double-degree",
    label: "Double degree: Computer Science + Economics (BA), 150 credits",
    plan: plan({
      programs: ["cmsc-major", "econ-major-ba"],
      startTerm: "Fall 2026",
      terms: spread(merge(CMSC, ECON_BA), ELECTIVES),
      extra: { degreeMode: "double-degree" },
    }),
  },
  {
    id: "bs-ms",
    label: "BS/MS: Computer Science with 600-level courses double-counted",
    plan: plan({
      programs: ["cmsc-major"],
      startTerm: "Fall 2026",
      terms: CMSC.map((t, i) => (i === 6 ? [...t, "CMSC630", "CMSC660"] : i === 7 ? [...t, "CMSC726"] : t)),
      extra: { mastersCredits: 30 },
    }),
  },
  {
    id: "dropped-minor",
    label: "CS major with an Economics minor, about to drop the minor",
    plan: plan({ programs: ["cmsc-major", "econ-minor"], startTerm: "Fall 2026", terms: merge(CMSC, ECON_MINOR) }),
  },
  {
    id: "math-cs-double-major",
    label: "Math (Applied) + CS as a double major (the owner's plan)",
    plan: plan({ programs: ["math-major-applied", "cmsc-major"], startTerm: "Fall 2026", terms: ownerIds, extra: { prior: OWNER_PRIOR } }),
  },
  {
    id: "math-cs-double-degree",
    label: "Math (Applied) + CS as a double degree (owner plan plus three terms)",
    plan: plan({
      programs: ["math-major-applied", "cmsc-major"],
      startTerm: "Fall 2026",
      terms: [...ownerIds, ...OWNER_EXTRA_TERMS],
      extra: { degreeMode: "double-degree", prior: OWNER_PRIOR },
    }),
  },
];

// Patched below: grad courses double-counted for the BS/MS student.
for (const term of TEST_STUDENTS.find((s) => s.id === "bs-ms")!.plan.terms) {
  term.courses = term.courses.map((c, i) => (/^CMSC6\d\d$/.test(c.id) ? { ...c, status: "completed" as const, grade: ["A", "A-", "B+"][i % 3]!, gradTag: "bs-ms" as const } : c));
}

// Development-only example data for screenshots and local checks: /advisor?seed=owner loads a
// Math (Applied) + CS plan (the terms of packages/plan/test/fixtures/owner-plan.ts) with AP
// Calculus BC 5 entered, and signs the agreement as "UI Check". Inert in production builds unless
// NEXT_PUBLIC_TURBOTERP_SEED=1, so a student can never skip the agreement.
// &tracks=pre-med,pre-law adds those tracks to the owner seed's plan (unknown ids dropped), for
// screenshotting the Tracks checks and audit section without hand-editing the owner plan above.
// ?seed=student&id=<id> loads a test student (test-students.ts).
// &degree=double-degree checks the owner plan as two degrees (the double-degree checks).

// TRACKS comes from "@turboterp/tracks/list" (no runtime @turboterp/audit import), so this stays
// out of the main bundle's solver code -- store.ts, which calls seedFromUrl, is part of it.
import { TRACKS } from "@turboterp/tracks/list";
import { CONSENT_VERSION, type ConsentRecord } from "./consent";
import { OWNER_TERMS, TEST_STUDENTS } from "./test-students";
import { DEGREE_CHOICES, emptyPrior, type AdvisorPlan, type DegreeChoice } from "./plan-state";

type Env = { NODE_ENV?: string; NEXT_PUBLIC_TURBOTERP_SEED?: string };

export function seedAllowed(env: Env): boolean {
  return env.NODE_ENV === "development" || env.NEXT_PUBLIC_TURBOTERP_SEED === "1";
}

function ownerPlan(): AdvisorPlan {
  return {
    v: 1,
    programs: ["math-major-applied", "cmsc-major"],
    catalogYear: "2026-27",
    startTerm: "Fall 2026",
    terms: OWNER_TERMS.map(([name, ids]) => ({ name, courses: ids.map((id) => ({ id })) })),
    prior: { ...emptyPrior(), ap: [{ key: "seed-ap-1", exam: "Calculus BC", score: 5 }] },
  };
}

const KNOWN_TRACK_IDS = new Set(TRACKS.map((t) => t.id));

export function seedFromUrl(search: string, env: Env): { plan: AdvisorPlan | null; consent: ConsentRecord } | null {
  if (!seedAllowed(env)) return null;
  const params = new URLSearchParams(search);
  const seed = params.get("seed");
  if (seed !== "owner" && seed !== "signed" && seed !== "student") return null;
  const consent = { name: "UI Check", acceptedAt: "2026-09-25T12:00:00.000Z", version: CONSENT_VERSION };
  // ?seed=student&id=<id> opens one of the test students (test-students.ts); an unknown id opens none.
  if (seed === "student") return { plan: structuredClone(TEST_STUDENTS.find((s) => s.id === params.get("id"))?.plan ?? null), consent };
  if (seed !== "owner") return { plan: null, consent };
  const plan = ownerPlan();
  const tracks = (params.get("tracks") ?? "").split(",").filter((id) => KNOWN_TRACK_IDS.has(id));
  if (tracks.length) plan.tracks = tracks;
  const degree = params.get("degree");
  if (DEGREE_CHOICES.includes(degree as DegreeChoice)) plan.degreeMode = degree as DegreeChoice;
  // &add=pwrt-minor appends programs; &slots=pwrt-minor/approved-courses ticks those Open Slots.
  const csv = (name: string) => (params.get(name) ?? "").split(",").filter(Boolean);
  plan.programs.push(...csv("add").filter((id) => !plan.programs.includes(id)));
  const slots = csv("slots");
  if (slots.length) plan.confirmedSlots = slots;
  return { plan, consent };
}

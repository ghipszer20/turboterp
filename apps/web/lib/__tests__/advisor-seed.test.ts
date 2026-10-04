import { describe, expect, it } from "vitest";
import { seedAllowed, seedFromUrl } from "../advisor/seed";
import { parsePlan, serializePlan } from "../advisor/storage";
import { hasConsent } from "../advisor/consent";

const dev = { NODE_ENV: "development" };
const prod = { NODE_ENV: "production" };

describe("seedAllowed", () => {
  it("is on under next dev, or with NEXT_PUBLIC_TURBOTERP_SEED=1 for a local production check", () => {
    expect(seedAllowed(dev)).toBe(true);
    expect(seedAllowed(prod)).toBe(false);
    expect(seedAllowed({ NODE_ENV: "production", NEXT_PUBLIC_TURBOTERP_SEED: "1" })).toBe(true);
  });
});

describe("seedFromUrl", () => {
  it("does nothing in production, so the agreement can never be skipped there", () => {
    expect(seedFromUrl("?seed=owner", prod)).toBeNull();
  });

  it("does nothing without a known seed", () => {
    expect(seedFromUrl("", dev)).toBeNull();
    expect(seedFromUrl("?seed=nope", dev)).toBeNull();
  });

  it("gives the Math (Applied) + CS example plan with AP Calculus BC 5 entered as prior credit", () => {
    const seed = seedFromUrl("?seed=owner", dev)!;
    expect(seed.plan!.programs).toEqual(["math-major-applied", "cmsc-major"]);
    expect(seed.plan!.prior.ap).toEqual([{ key: "seed-ap-1", exam: "Calculus BC", score: 5 }]);
    expect(seed.plan!.terms).toHaveLength(8);
    expect(seed.plan!.terms[0]!.courses.map((c) => c.id)).toEqual(["CMSC131", "MATH240", "ENGL101", "CMNS100", "HIST200"]);
    expect(parsePlan(serializePlan(seed.plan!))).toEqual(seed.plan);
    expect(hasConsent(seed.consent)).toBe(true);
  });

  it("can seed only the agreement, for an empty plan", () => {
    const seed = seedFromUrl("?seed=signed", dev)!;
    expect(seed.plan).toBeNull();
    expect(hasConsent(seed.consent)).toBe(true);
  });

  it("adds tracks named in the URL to the owner seed's plan, dropping an unknown one", () => {
    const seed = seedFromUrl("?seed=owner&tracks=pre-med,not-a-track,pre-law", dev)!;
    expect(seed.plan!.tracks).toEqual(["pre-med", "pre-law"]);
  });

  it("sets double major vs double degree from the URL, ignoring an unknown value", () => {
    expect(seedFromUrl("?seed=owner&degree=double-degree", dev)!.plan!.degreeMode).toBe("double-degree");
    expect(seedFromUrl("?seed=owner&degree=nope", dev)!.plan).not.toHaveProperty("degreeMode");
  });

  it("adds programs and confirmed open slots from the URL", () => {
    const seed = seedFromUrl("?seed=owner&add=pwrt-minor&slots=pwrt-minor/approved-courses", dev)!;
    expect(seed.plan!.programs).toEqual(["math-major-applied", "cmsc-major", "pwrt-minor"]);
    expect(seed.plan!.confirmedSlots).toEqual(["pwrt-minor/approved-courses"]);
    expect(seedFromUrl("?seed=owner", dev)!.plan).not.toHaveProperty("confirmedSlots");
  });

  it("leaves the owner seed's plan without a tracks field when none are given", () => {
    const seed = seedFromUrl("?seed=owner", dev)!;
    expect(seed.plan).not.toHaveProperty("tracks");
  });

  it("ignores a tracks param on the plain (planless) signed seed", () => {
    const seed = seedFromUrl("?seed=signed&tracks=pre-med", dev)!;
    expect(seed.plan).toBeNull();
  });
});

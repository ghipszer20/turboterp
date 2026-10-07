import { describe, expect, it } from "vitest";
import { checkerPlan } from "../advisor/checker";
import type { AdvisorPlan } from "../advisor/plan-state";

describe("checkerPlan", () => {
  it("keeps exam credit's genEdCredits (a lab-science lecture awarded with its lab)", () => {
    const plan = { terms: [] } as unknown as AdvisorPlan;
    const out = checkerPlan(plan, [{ id: "CHEM131", credits: 3, status: "completed", genEd: ["DSNL"], genEdCredits: 4, source: "AP Chemistry (4)" }]);
    expect(out.priorCredit![0]!.genEdCredits).toBe(4);
  });
});

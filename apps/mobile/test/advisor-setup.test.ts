import { describe, expect, it } from "vitest";
import { newPlan } from "@turboterp/app-core/plan-state";
import { TRACKS } from "@turboterp/app-core/tracks";
import { applySetup, canContinue, initialForm, sharedExamMilestones } from "../src/advisor/setup-model";

describe("setup model", () => {
  it("first run: needs a program, then builds a fresh plan", () => {
    const form = initialForm(null, 2026);
    expect(canContinue(form)).toBe(false);
    const next = applySetup(null, { ...form, programs: ["acct-major"], startTerm: "Fall 2026" });
    expect(next.programs).toEqual(["acct-major"]);
    expect(next.startTerm).toBe("Fall 2026");
    expect(next.entry).not.toBe("transfer");
    expect(next.terms.length).toBeGreaterThan(0);
  });

  it("transfer flag sets entry on a first plan", () => {
    const form = initialForm(null, 2026);
    expect(applySetup(null, { ...form, programs: ["acct-major"], transfer: true }).entry).toBe("transfer");
  });

  it("editing applies changes to the saved plan", () => {
    const base = newPlan({ programs: ["acct-major"], catalogYear: "2026-27", startTerm: "Fall 2026" });
    const form = { ...initialForm(base, 2026), programs: ["acct-major", "aero-major-aeronautical"] };
    expect(applySetup(base, form).programs).toEqual(["acct-major", "aero-major-aeronautical"]);
  });

  it("form starts from the saved plan", () => {
    const base = newPlan({ programs: ["acct-major"], catalogYear: "2026-27", startTerm: "Fall 2026", tracks: [TRACKS[0]!.id] });
    const form = initialForm(base, 2026);
    expect(form.programs).toEqual(["acct-major"]);
    expect(form.tracks).toEqual([TRACKS[0]!.id]);
    expect(form.startTerm).toBe("Fall 2026");
  });

  it("shares one exam control between tracks with the same exam", () => {
    const ids = sharedExamMilestones(TRACKS.slice()).map((x) => x.milestone.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

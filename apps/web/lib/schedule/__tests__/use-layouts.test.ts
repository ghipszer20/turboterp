import { describe, expect, it } from "vitest";
import type { GenerateRequest, GenerateResult } from "../generate";
import { shownLayouts } from "../use-layouts";

const req = (...courseIds: string[]) => ({ courseIds, sections: courseIds.map((courseId) => ({ courseId, id: "0101" })) }) as unknown as GenerateRequest;
const result = { layouts: { count: 3 } } as GenerateResult;

describe("shownLayouts", () => {
  it("is empty and not pending without a request", () => {
    expect(shownLayouts(null, null)).toEqual({ shown: null, pending: false });
  });

  it("is pending with nothing to show before the first answer", () => {
    expect(shownLayouts(req("CMSC131"), null)).toEqual({ shown: null, pending: true });
  });

  it("shows the answer for the current request", () => {
    const current = req("CMSC131", "MATH141");
    const out = shownLayouts(current, { req: current, result });
    expect(out.pending).toBe(false);
    expect(out.shown).toEqual({ result, req: current });
  });

  // Removing a course starts a new request, and the removed course's sections leave the loaded data
  // at once. Until the new answer arrives the old layouts stay on screen, so they must be decoded
  // with the request they were generated from (its course list AND its sections), not the current one.
  it("keeps the old answer with its own request while a new request is pending", () => {
    const old = req("CMSC131", "MATH141");
    const out = shownLayouts(req("MATH141"), { req: old, result });
    expect(out.pending).toBe(true);
    expect(out.shown!.req).toBe(old);
    expect(out.shown!.req.sections.map((s) => s.courseId)).toEqual(["CMSC131", "MATH141"]);
  });
});

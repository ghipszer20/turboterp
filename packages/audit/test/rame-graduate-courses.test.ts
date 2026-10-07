// RAME reserves graduate courses for graduate students (department page: "Courses at the 600-, 700-
// and 800-levels are reserved for graduate students"), so its language track opts out of the
// grad-courses-count rule (graduate-courses.test.ts).

import { describe, expect, it } from "vitest";
import { auditProgram, type StudentCourse } from "../src/audit.ts";
import { rameMajorLanguageTrack } from "../programs/rame-major-2026-27.ts";

const took = (...ids: string[]): StudentCourse[] => ids.map((id) => ({ id, credits: 3, status: "completed", grade: "B" }));

describe("RAME language track and graduate courses", () => {
  it("doesn't count a 600-level HEBR course toward the language track", async () => {
    const r = await auditProgram(rameMajorLanguageTrack, took("HEBR313", "HEBR611"));
    expect(r.requirements.find((x) => x.id === "language-track")?.assigned).toEqual(["HEBR313"]);
  });
});

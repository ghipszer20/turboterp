// College intro course: a college requirement layer for freshman entrants (owner ruling 2026-09-29).

import { describe, expect, it } from "vitest";
import { auditProgram, type StudentCourse } from "../src/audit.ts";
import { COLLEGE_INTRO_REQUIRED, collegeIntro } from "../programs/college-intro.ts";

const c = (id: string): StudentCourse => ({ id, credits: 1, status: "planned" });
const status = async (college: string, courses: StudentCourse[]) => (await auditProgram(collegeIntro(college)!, courses)).requirements[0]!.status;

describe("collegeIntro", () => {
  it("is a college-layer program named for the college's course", () => {
    const p = collegeIntro("CMNS")!;
    expect(p.layer).toBe("college");
    expect(p.requirements[0]!.name).toBe("College intro course (CMNS100 or UNIV100)");
  });

  it("CMNS: unmet without the course, met by CMNS100 or UNIV100", async () => {
    expect(await status("CMNS", [c("MATH140")])).not.toBe("satisfied");
    expect(await status("CMNS", [c("CMNS100")])).toBe("satisfied");
    expect(await status("CMNS", [c("UNIV100")])).toBe("satisfied");
  });

  it("ARHU needs ARHU158 and SPHL needs UNIV100", async () => {
    expect(await status("ARHU", [c("UNIV100")])).not.toBe("satisfied");
    expect(await status("ARHU", [c("ARHU158")])).toBe("satisfied");
    expect(await status("ARHU", [c("ARHU158A")])).toBe("satisfied");
    expect(await status("ARHU", [c("ARHU158V")])).toBe("satisfied");
    expect(await status("ARHU", [c("ARHU159")])).not.toBe("satisfied");
    expect(await status("SPHL", [c("UNIV100")])).toBe("satisfied");
  });

  it("has no layer for colleges without a required intro course, or for transfers", () => {
    expect(collegeIntro("BMGT")).toBeNull();
    expect(collegeIntro("INFO")).toBeNull();
    expect(collegeIntro("CMNS", "transfer")).toBeNull();
    expect(Object.keys(COLLEGE_INTRO_REQUIRED).sort()).toEqual(["ARHU", "CMNS", "SPHL"]);
  });
});

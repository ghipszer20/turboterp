// Gen Ed credit minimums (Summary Chart, gened.umd.edu, revised 2024-04-02): DSHS/DSHU/DSSP 6 credits,
// Natural Sciences 7 credits with at least one lab course, each Fundamental Studies category 3 credits.

import { describe, expect, it } from "vitest";
import { auditProgram, type StudentCourse } from "../src/audit.ts";
import { genEd } from "../programs/gen-ed-2026-27.ts";

const c = (id: string, credits: number, codes: string[], genEdCredits?: number): StudentCourse => ({
  id, credits, status: "completed", grade: "B", genEd: codes, ...(genEdCredits === undefined ? {} : { genEdCredits }),
});
const status = async (courses: StudentCourse[], id: string) =>
  (await auditProgram(genEd, courses)).requirements.find((r) => r.id === id)!.status;

describe("Scholarship in Practice: 2 courses and 6 credits", () => {
  it("passes with two 3-credit courses", async () => {
    expect(await status([c("AAAA100", 3, ["DSSP"]), c("AAAA101", 3, ["DSSP"])], "dssp")).toBe("satisfied");
  });
  it("is partial with 1 and 2 credits", async () => {
    expect(await status([c("AAAA100", 1, ["DSSP"]), c("AAAA101", 2, ["DSSP"])], "dssp")).toBe("partial");
  });
  it("passes when a third 3-credit course reaches 6 credits", async () => {
    expect(await status([c("AAAA100", 1, ["DSSP"]), c("AAAA101", 2, ["DSSP"]), c("AAAA102", 3, ["DSSP"])], "dssp")).toBe("satisfied");
  });
  it("is partial with one 6-credit course (2 courses needed)", async () => {
    expect(await status([c("AAAA100", 6, ["DSSP"])], "dssp")).toBe("partial");
  });
});

describe("Natural Sciences: 7 credits, one lab course", () => {
  it("passes with DSNL 4 + DSNS 3", async () => {
    const plan = [c("BBBB100", 4, ["DSNL"]), c("BBBB101", 3, ["DSNS"])];
    expect([await status(plan, "natsci"), await status(plan, "dsnl")]).toEqual(["satisfied", "satisfied"]);
  });
  it("is partial with DSNL 3 + DSNS 3", async () => {
    expect(await status([c("BBBB100", 3, ["DSNL"]), c("BBBB101", 3, ["DSNS"])], "natsci")).toBe("partial");
  });
  it("counts a lecture's paired-lab credits through genEdCredits", async () => {
    expect(await status([c("BBBB100", 3, ["DSNL"], 4), c("BBBB101", 3, ["DSNS"])], "natsci")).toBe("satisfied");
  });
  it("fails the lab row with two DSNS courses", async () => {
    const plan = [c("BBBB100", 4, ["DSNS"]), c("BBBB101", 3, ["DSNS"])];
    expect([await status(plan, "natsci"), await status(plan, "dsnl")]).toEqual(["satisfied", "missing"]);
  });
  it("passes both rows with two DSNL courses", async () => {
    const plan = [c("BBBB100", 4, ["DSNL"]), c("BBBB101", 4, ["DSNL"])];
    expect([await status(plan, "natsci"), await status(plan, "dsnl")]).toEqual(["satisfied", "satisfied"]);
  });
});

describe("other rules", () => {
  it("History and Social Sciences needs 6 credits", async () => {
    expect(await status([c("CCCC100", 3, ["DSHS"]), c("CCCC101", 2, ["DSHS"])], "dshs")).toBe("partial");
  });
  it("a Fundamental Studies course needs 3 credits", async () => {
    expect(await status([c("DDDD100", 2, ["FSOC"])], "fsoc")).toBe("partial");
    expect(await status([c("DDDD100", 3, ["FSOC"])], "fsoc")).toBe("satisfied");
  });
  it("one course fills only one Distributive Studies category", async () => {
    const plan = [c("EEEE100", 3, ["DSHS", "DSHU"]), c("EEEE101", 3, ["DSHS"]), c("EEEE102", 3, ["DSHU"])];
    const r = (await auditProgram(genEd, plan)).requirements;
    expect(r.find((x) => x.id === "dshs")!.status === "satisfied" && r.find((x) => x.id === "dshu")!.status === "satisfied").toBe(false);
  });
  it("Big Question still needs a Distributive Studies course", async () => {
    expect(await status([c("FFFF100", 3, ["SCIS"]), c("FFFF101", 3, ["SCIS"])], "scis")).not.toBe("satisfied");
  });
});

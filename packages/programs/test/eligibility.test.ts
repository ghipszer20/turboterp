// Eligibility gates (ProgramMeta.notOpenTo): a minor or certificate closed to some majors is
// blocked for students who have declared one. Owner ruling, docs/project/rulings.md "Minors".
import { describe, expect, it } from "vitest";
import { blockedReason, findProgram, majorKey, PROGRAMS, type ProgramEntry } from "../src/registry.ts";

const load = async () => ({}) as never;
const entry = (e: Partial<ProgramEntry> & Pick<ProgramEntry, "id" | "kind">): ProgramEntry => ({
  name: e.id,
  college: "CMNS",
  catalogYear: "2026-27",
  verified: false,
  sources: {},
  load,
  ...e,
});

const minor = entry({ id: "x-minor", kind: "minor", notOpenTo: { programs: ["astr", "phys-major"], colleges: ["BMGT"], reason: "Not open to X majors." } });
const astrTrack = entry({ id: "astr-major-data", kind: "major", major: "astr" });
const physMajor = entry({ id: "phys-major", kind: "major", major: "phys" });
const physOtherTrack = entry({ id: "phys-major-applied", kind: "major", major: "phys" });
const bmgtMajor = entry({ id: "acct-major", kind: "major", college: "BMGT" });
const bmgtMinor = entry({ id: "bmgt-other-minor", kind: "minor", college: "BMGT" });
const unrelated = entry({ id: "cmsc-major", kind: "major" });
const only = entry({ id: "y-minor", kind: "minor", onlyOpenTo: { programs: ["astr", "phys-major"], colleges: ["BMGT"], reason: "Only open to Y majors." } });
const both = entry({ id: "z-minor", kind: "minor", notOpenTo: { programs: ["phys-major"], reason: "Not open to physics." }, onlyOpenTo: { programs: ["astr", "phys"], reason: "Only open to astro or physics." } });
const all = [only, both, minor, astrTrack, physMajor, physOtherTrack, bmgtMajor, bmgtMinor, unrelated];
const lookup = (id: string) => all.find((e) => e.id === id);

describe("blockedReason", () => {
  it("returns undefined for a program with no gate", () => {
    expect(blockedReason(unrelated, ["astr-major-data"], lookup)).toBeUndefined();
  });

  it("blocks by major key, covering every track", () => {
    expect(blockedReason(minor, ["astr-major-data"], lookup)).toBe("Not open to X majors.");
  });

  it("blocks by program id, only that track", () => {
    expect(blockedReason(minor, ["phys-major"], lookup)).toBe("Not open to X majors.");
    expect(blockedReason(minor, ["phys-major-applied"], lookup)).toBeUndefined();
  });

  it("blocks every major of a listed college, but not its minors", () => {
    expect(blockedReason(minor, ["acct-major"], lookup)).toBe("Not open to X majors.");
    expect(blockedReason(minor, ["bmgt-other-minor"], lookup)).toBeUndefined();
  });

  it("ignores unrelated and unknown declared ids", () => {
    expect(blockedReason(minor, ["cmsc-major", "no-such-id"], lookup)).toBeUndefined();
    expect(blockedReason(minor, [], lookup)).toBeUndefined();
  });

  it("onlyOpenTo blocks a declared major matching none of the list", () => {
    expect(blockedReason(only, ["cmsc-major"], lookup)).toBe("Only open to Y majors.");
    expect(blockedReason(only, ["phys-major-applied"], lookup)).toBe("Only open to Y majors.");
  });

  it("onlyOpenTo passes a match by key, id or college", () => {
    expect(blockedReason(only, ["astr-major-data"], lookup)).toBeUndefined();
    expect(blockedReason(only, ["phys-major"], lookup)).toBeUndefined();
    expect(blockedReason(only, ["acct-major"], lookup)).toBeUndefined();
  });

  it("onlyOpenTo passes when any one declared major matches", () => {
    expect(blockedReason(only, ["cmsc-major", "astr-major-data"], lookup)).toBeUndefined();
  });

  it("onlyOpenTo does not block students with no declared major", () => {
    expect(blockedReason(only, [], lookup)).toBeUndefined();
    expect(blockedReason(only, ["bmgt-other-minor", "no-such-id"], lookup)).toBeUndefined();
  });

  it("either gate can block when both are set", () => {
    expect(blockedReason(both, ["phys-major"], lookup)).toBe("Not open to physics.");
    expect(blockedReason(both, ["cmsc-major"], lookup)).toBe("Only open to astro or physics.");
    expect(blockedReason(both, ["phys-major-applied"], lookup)).toBeUndefined();
  });

  it("uses the registry by default", () => {
    const astr = PROGRAMS.find((p) => p.id === "astr-minor")!;
    expect(blockedReason(astr, ["astr-major-data-science"])).toBe(astr.notOpenTo?.reason);
  });
});

// Harness: every gate in the registry names real majors and actually bites.
describe("every registered eligibility gate", () => {
  const majors = PROGRAMS.filter((p) => p.kind === "major");
  const gated = PROGRAMS.filter((p) => p.notOpenTo);

  it("exists for the encoded examples", () => {
    expect(gated.map((p) => p.id)).toEqual(expect.arrayContaining(["astr-minor", "neur-minor", "bmgt-minor-general-business"]));
  });

  for (const p of gated) {
    const gate = p.notOpenTo!;
    describe(p.id, () => {
      it("names only registered majors (program id or major key) and colleges with majors", () => {
        for (const ref of gate.programs ?? []) {
          expect(majors.some((m) => m.id === ref || majorKey(m) === ref), `${ref} is not a registered major id or major key`).toBe(true);
        }
        for (const c of gate.colleges ?? []) {
          expect(majors.some((m) => m.college === c), `${c} owns no registered major`).toBe(true);
        }
        expect(gate.reason.trim()).not.toBe("");
      });

      it("blocks one excluded major and lets an unrelated major through", () => {
        const excluded = majors.find((m) => (gate.programs ?? []).some((ref) => m.id === ref || majorKey(m) === ref) || (gate.colleges ?? []).includes(m.college))!;
        expect(blockedReason(p, [excluded.id])).toBe(gate.reason);
        const other = majors.find((m) => blockedReason(p, [m.id]) === undefined)!;
        expect(other).toBeDefined();
        expect(findProgram(other.id)).toBeDefined();
      });
    });
  }
});

describe("every registered onlyOpenTo gate", () => {
  const majors = PROGRAMS.filter((p) => p.kind === "major");
  const gated = PROGRAMS.filter((p) => p.onlyOpenTo);
  const listed = (gate: NonNullable<ProgramEntry["onlyOpenTo"]>, m: ProgramEntry) =>
    (gate.programs ?? []).some((ref) => m.id === ref || majorKey(m) === ref) || (gate.colleges ?? []).includes(m.college);

  it("exists for the encoded examples", () => {
    expect(gated.map((p) => p.id)).toEqual(
      expect.arrayContaining(["cmsc-minor-computational-finance", "engr-minor-nanoscale-science-technology"]),
    );
    expect(gated).toHaveLength(3);
  });

  for (const p of gated) {
    const gate = p.onlyOpenTo!;
    describe(p.id, () => {
      it("names only registered majors and colleges with majors, and starts 'Only open to'", () => {
        for (const ref of gate.programs ?? []) {
          expect(majors.some((m) => m.id === ref || majorKey(m) === ref), `${ref} is not a registered major id or major key`).toBe(true);
        }
        for (const c of gate.colleges ?? []) {
          expect(majors.some((m) => m.college === c), `${c} owns no registered major`).toBe(true);
        }
        expect(gate.reason).toMatch(/^Only open to /);
      });

      it("passes one listed major and blocks one unlisted major", () => {
        const allowed = majors.find((m) => listed(gate, m))!;
        expect(blockedReason(p, [allowed.id])).toBeUndefined();
        const unlisted = majors.find((m) => !listed(gate, m))!;
        expect(blockedReason(p, [unlisted.id])).toBe(gate.reason);
        expect(blockedReason(p, [])).toBeUndefined();
      });
    });
  }
});

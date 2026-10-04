import { describe, expect, it } from "vitest";
import {
  auditedPrograms,
  blockedNotice,
  collegeOf,
  degreeModeOf,
  MAX_NOTICE_CANDIDATES,
  noticeCandidates,
  NOTICE_OVERLAP_THRESHOLD,
  PROGRAM_OPTIONS,
  programsLabel,
  rankNoticeCandidates,
  studentDegrees,
  toggleProgram,
} from "../advisor/programs";
import type { ProgramOption } from "../advisor/programs";
import { PROGRAMS } from "@turboterp/programs";

const ids = (list: { id: string }[]) => list.map((p) => p.id);

describe("program options", () => {
  it("is the registry's own list, majors first (registry.test.ts covers the full ordering)", () => {
    expect(PROGRAM_OPTIONS).toBe(PROGRAMS);
    expect(PROGRAM_OPTIONS.length).toBeGreaterThan(3);
    const firstNonMajor = PROGRAM_OPTIONS.findIndex((o) => o.kind !== "major");
    expect(firstNonMajor).toBeGreaterThan(0);
    expect(PROGRAM_OPTIONS.slice(0, firstNonMajor).every((o) => o.kind === "major")).toBe(true);
    expect(PROGRAM_OPTIONS.every((o) => !o.verified)).toBe(true);
  });

  it("carries no Program: requirements load only when a program is audited", () => {
    expect(PROGRAM_OPTIONS.every((o) => !("program" in o) && typeof o.load === "function")).toBe(true);
  });
});

describe("collegeOf", () => {
  it("uses the first declared major's college", () => {
    expect(collegeOf(["cmsc-major", "math-major-applied"])).toBe("CMNS");
  });

  it("prefers a major over a special program chosen first", () => {
    expect(collegeOf(["dept-honors-engl", "cmsc-major"])).toBe("CMNS");
  });

  it("falls back to the first program when no major is chosen", () => {
    expect(collegeOf(["dept-honors-engl"])).toBe("ARHU");
  });

  it("is undefined with no programs chosen", () => {
    expect(collegeOf([])).toBeUndefined();
  });

  it("ignores an unknown program id", () => {
    expect(collegeOf(["nope"])).toBeUndefined();
  });
});

describe("toggleProgram", () => {
  it("adds and removes a major", () => {
    expect(toggleProgram([], "cmsc-major")).toEqual(["cmsc-major"]);
    expect(toggleProgram(["cmsc-major"], "cmsc-major")).toEqual([]);
  });

  it("keeps one track per major: picking Applied replaces Traditional in place", () => {
    expect(toggleProgram(["math-major-traditional", "cmsc-major"], "math-major-applied")).toEqual(["math-major-applied", "cmsc-major"]);
  });

  it("adds a non-major alongside majors", () => {
    expect(toggleProgram(["cmsc-major"], "honors-aces")).toEqual(["cmsc-major", "honors-aces"]);
  });

  it("ignores unknown ids", () => {
    expect(toggleProgram(["cmsc-major"], "nope")).toEqual(["cmsc-major"]);
  });
});

describe("auditedPrograms", () => {
  it("loads the chosen programs, then Gen Ed and the university rules", async () => {
    expect(ids(await auditedPrograms(["math-major-applied", "cmsc-major", "honors-aces"]))).toEqual([
      "math-major-applied",
      "cmsc-major",
      "honors-aces",
      "gen-ed",
      "university",
    ]);
  });
});

describe("studentDegrees", () => {
  const shape = (degrees: Awaited<ReturnType<typeof studentDegrees>>) =>
    degrees.map((d) => d.programs.map((p) => `${p.program.id}:${p.kind}:${p.status}`));
  const picked = ["math-major-applied", "cmsc-major", "honors-aces"];

  it("puts every program in one degree for a double major", async () => {
    expect(shape(await studentDegrees(picked, "double-major"))).toEqual([
      ["math-major-applied:major:planned", "cmsc-major:major:planned", "honors-aces:special:planned"],
    ]);
  });

  it("gives each major its own degree for a double degree; other programs go with the first", async () => {
    expect(shape(await studentDegrees(picked, "double-degree"))).toEqual([
      ["math-major-applied:major:planned", "honors-aces:special:planned"],
      ["cmsc-major:major:planned"],
    ]);
  });

  it("uses one degree with a single major, whatever the mode says", async () => {
    expect(shape(await studentDegrees(["cmsc-major", "honors-aces"], "double-degree"))).toHaveLength(1);
  });
});

describe("degreeModeOf", () => {
  it("is a double major by default with two majors, the stored choice when set, and null with one major", () => {
    expect(degreeModeOf(["math-major-applied", "cmsc-major"], undefined)).toBe("double-major");
    expect(degreeModeOf(["math-major-applied", "cmsc-major"], "double-degree")).toBe("double-degree");
    expect(degreeModeOf(["cmsc-major", "honors-aces"], "double-degree")).toBeNull();
  });
});

// Synthetic majors and course sets, standing in for the real registry so these tests don't
// hardcode it (and need rewriting whenever a program batch changes the majors or their course
// sets). `major` takes an explicit majorKey so more than one "track" can share it, and an optional
// `loaded` callback to prove a filtered-out major is never loaded. noticeCandidates and
// rankNoticeCandidates both take `options`/`courseSets` explicitly for exactly this reason.
const major = (id: string, opts: { major?: string; loaded?: () => void } = {}): ProgramOption =>
  ({
    id,
    name: id,
    kind: "major",
    major: opts.major,
    college: "CMNS",
    catalogYear: "2026-27",
    verified: false,
    sources: {},
    load: async () => {
      opts.loaded?.();
      return { id, name: id, requirements: [] };
    },
  }) as ProgramOption;

const special = (id: string): ProgramOption =>
  ({ id, name: id, kind: "special", college: "UGST", catalogYear: "2026-27", verified: false, sources: {}, load: async () => ({ id, name: id, requirements: [] }) }) as ProgramOption;

describe("noticeCandidates", () => {
  const PLAN = ["A", "B", "C", "D"];
  const csGeneral = major("cs-general", { major: "cs" });
  const csMl = major("cs-ml", { major: "cs" });
  const mathMajor = major("math");
  const bio = major("bio");
  const chem = major("chem"); // no course set on record: never clears the overlap threshold
  let astroLoaded = false;
  const astro = major("astro", { loaded: () => (astroLoaded = true) });
  const OPTIONS = [csGeneral, csMl, mathMajor, astro, bio, chem, special("special-x")];
  const COURSE_SETS = { "cs-general": ["A", "B", "C", "D"], "cs-ml": ["A", "B", "C", "D"], math: ["A", "B"], astro: ["A"], bio: ["A", "B", "C"] };

  it("passes chosen majors as declared, in order, and other majors as undeclared", async () => {
    const c = await noticeCandidates(["math"], PLAN, OPTIONS, COURSE_SETS);
    expect(c.map((x) => [x.program.id, x.declared])).toEqual([
      ["math", true],
      // Undeclared majors, ranked by share of the plan's courses they list: cs (via its first/
      // default track, cs-general) 4/4, bio 3/4; astro's 1/4 misses NOTICE_OVERLAP_THRESHOLD and
      // chem has no course set on record, so neither is offered.
      ["cs-general", false],
      ["bio", false],
    ]);
  });

  it("never offers another track of a chosen major (that isn't a double major)", async () => {
    expect((await noticeCandidates(["cs-general", "math"], PLAN, OPTIONS, COURSE_SETS)).map((x) => x.program.id)).toEqual([
      "cs-general",
      "math",
      // cs-ml excluded: it shares cs-general's major key, and two tracks of one major aren't a
      // double major.
      "bio",
    ]);
  });

  it("offers one track of an unchosen major: whichever comes first among that major's options", async () => {
    const csMlFirst = [csMl, csGeneral, mathMajor, astro, bio, chem];
    expect((await noticeCandidates(["math"], PLAN, csMlFirst, COURSE_SETS)).map((x) => x.program.id)).toEqual(["math", "cs-ml", "bio"]);
  });

  it("only majors take part: a chosen special program is never a double major", async () => {
    expect((await noticeCandidates(["cs-general", "special-x"], PLAN, OPTIONS, COURSE_SETS)).map((x) => x.program.id)).toEqual([
      "cs-general",
      "bio",
      "math",
    ]);
  });

  it("never offers Gen Ed or the university rules", async () => {
    expect((await noticeCandidates([], [], OPTIONS, COURSE_SETS)).map((x) => x.program.id)).toEqual([]);
  });

  it("drops an undeclared major the plan barely overlaps with, without loading it", async () => {
    astroLoaded = false;
    const result = await noticeCandidates(["cs-general"], PLAN, OPTIONS, COURSE_SETS);
    expect(result.map((x) => x.program.id)).toEqual(["cs-general", "bio", "math"]);
    expect(astroLoaded).toBe(false);
  });

  it("defaults to no plan courses, so an undeclared major is never offered with nothing to compare", async () => {
    expect((await noticeCandidates(["cs-general"], undefined, OPTIONS, COURSE_SETS)).map((x) => x.program.id)).toEqual(["cs-general"]);
  });
});

describe("rankNoticeCandidates", () => {
  it("keeps only majors clearing the overlap threshold, best overlap first", () => {
    // The share is of the PLAN's courses, not the major's: "high" matches both plan courses,
    // "low" only one, "none" matches neither and is dropped.
    const options = [major("low"), major("high"), major("none")];
    const courseSets = { high: ["A", "B"], low: ["A", "C", "D"], none: ["X", "Y"] };
    const ranked = rankNoticeCandidates(options, ["A", "B"], courseSets);
    expect(ranked.map((o) => o.id)).toEqual(["high", "low"]);
  });

  it("caps the result at MAX_NOTICE_CANDIDATES even when more majors clear the threshold", () => {
    const options = Array.from({ length: MAX_NOTICE_CANDIDATES + 3 }, (_, i) => major(`m${i}`));
    const courseSets = Object.fromEntries(options.map((o) => [o.id, ["A"]]));
    const ranked = rankNoticeCandidates(options, ["A"], courseSets);
    expect(ranked.length).toBe(MAX_NOTICE_CANDIDATES);
  });

  it("never offers a major with no course set on record", () => {
    expect(rankNoticeCandidates([major("unknown")], ["A"], {})).toEqual([]);
  });

  it("offers nothing when the plan has no courses (nothing to compare)", () => {
    expect(rankNoticeCandidates([major("m")], [], { m: ["A"] })).toEqual([]);
  });

  it("NOTICE_OVERLAP_THRESHOLD is a fraction between 0 and 1", () => {
    expect(NOTICE_OVERLAP_THRESHOLD).toBeGreaterThan(0);
    expect(NOTICE_OVERLAP_THRESHOLD).toBeLessThanOrEqual(1);
  });
});

describe("programsLabel", () => {
  it("names the chosen programs briefly", () => {
    expect(programsLabel(["math-major-applied", "cmsc-major"])).toBe("Math (Applied) + Computer Science");
    expect(programsLabel(["honors-aces"])).toBe("Advanced Cybersecurity Experience for Students (ACES)");
  });

  it("names a picked minor or special program even with no major chosen", () => {
    expect(programsLabel(["honors-aces"])).not.toBe("No program chosen");
    expect(programsLabel(["dept-honors-engl"])).toBe("Departmental Honors: English");
  });

  it("says 'No program chosen' only when nothing is picked", () => {
    expect(programsLabel([])).toBe("No program chosen");
  });
});

describe("blockedNotice (saved state holding a blocked minor)", () => {
  it("names the reason when a chosen major closes the program", () => {
    expect(blockedNotice("astr-minor", ["astr-major-data-science", "astr-minor"])).toBe(
      "Not open to astronomy, physics or physical sciences majors. Remove it in Edit setup.",
    );
  });

  it("is undefined when the program is open, ungated or unknown", () => {
    expect(blockedNotice("astr-minor", ["cmsc-major", "astr-minor"])).toBeUndefined();
    expect(blockedNotice("cmsc-major", ["astr-major-data-science"])).toBeUndefined();
    expect(blockedNotice("no-such-program", ["astr-major-data-science"])).toBeUndefined();
  });
});

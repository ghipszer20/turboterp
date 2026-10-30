// No program requirement names an old ("Formerly") course code that Testudo has renumbered: the planner
// shows such a code with no title or credits. The audit still counts an old-code transcript course
// against the new code (the old code is a Renumbered Twin of it; see packages/plan/test/twin-aliases.test.ts).
// Needs the Testudo snapshots in the main checkout's gitignored packages/course-data/.cache; skipped without them.
// To fix a failure: `node packages/audit/scripts/replace-formerly.ts`.

import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { programCourseIds, type Program } from "../src/audit.ts";
import { loadCourses, renumberedTwins } from "../scripts/renumbered.ts";

/** Old codes kept on purpose, each with the reason. */
const ALLOWED: Record<string, string> = {
  // Several current courses claim the old code, so no single replacement is right; each needs a hand reading (reported by replace-formerly.ts).
  BSCI474: "claimed by BSCI374 and HLSC374",
  ENFP489I: "claimed by ENFP664 and ENFP464",
  BMGT438A: "claimed by BMGT394H, ENED394H, BMGT394 and ENED394",
  EDMS451: "claimed by QMMS451 and QMMS251",
  LASC235: "claimed by LACS235, SPAN235 and PORT235",
  AAST222: "claimed by cross-listed AAST322 and SOCY322",
};

const courses = loadCourses();
const programsDir = new URL("../programs/", import.meta.url);

describe.skipIf(!courses)("program files name no renumbered course code", () => {
  it("every literal course id is current (or allowlisted)", async () => {
    const twins = renumberedTwins(courses!);
    const hits: string[] = [];
    for (const file of readdirSync(programsDir).filter((f) => f.endsWith(".ts"))) {
      const mod = (await import(new URL(file, programsDir).href)) as Record<string, unknown>;
      for (const value of Object.values(mod)) {
        const p = value as Program;
        if (!p || typeof p !== "object" || !Array.isArray(p.requirements)) continue;
        for (const id of programCourseIds(p)) {
          const now = twins.get(id);
          if (now && !(id in ALLOWED)) hits.push(`${file}: ${id} -> ${now.join("/")}`);
        }
      }
    }
    expect(hits).toEqual([]);
  }, 120_000);
});

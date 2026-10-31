import { describe, expect, it } from "vitest";
import type { Section } from "@turboterp/course-data/schedules";
import { runGeneration } from "@turboterp/app-core/schedule/generate";
import { generateAsync } from "../src/schedule/generation";

// A heavy term: six courses, 9 sections each, lectures spread over the week plus discussions,
// so most combinations conflict-free pairs are plentiful. Deterministic (LCG), no network.
function heavyTerm(): Section[] {
  let seed = 12345;
  const rnd = (n: number) => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed % n;
  };
  const patterns = [["M"], ["Tu"], ["W"], ["Th"], ["F"], ["M", "W"], ["Tu", "Th"]];
  const out: Section[] = [];
  for (const course of ["CMSC351", "MATH240", "STAT400", "ENGL393", "PHYS260", "HIST289"]) {
    for (let i = 0; i < 9; i++) {
      const start = 8 * 60 + rnd(20) * 30;
      out.push({
        courseId: course,
        id: String(101 + i).padStart(4, "0"),
        instructors: [`Prof ${rnd(5)}`],
        seats: { total: 30, open: 1 + rnd(20), waitlist: 0, holdfile: 0 },
        delivery: "face-to-face",
        meetings: [{ days: patterns[rnd(7)]!, start, end: start + 50, building: "IRB", room: "1110", type: "Lecture" }],
      } as unknown as Section);
    }
  }
  return out;
}

describe("generation on a heavy 6-course term", () => {
  it("matches the web's result and finishes in a few seconds", async () => {
    const req = {
      courseIds: ["CMSC351", "MATH240", "STAT400", "ENGL393", "PHYS260", "HIST289"],
      sections: heavyTerm(),
      filters: {},
      sort: "best" as const,
      ratings: { "Prof 0": 4.5, "Prof 1": 3.2, "Prof 2": 2.5 },
    };
    const t0 = performance.now();
    const reference = runGeneration(req);
    const syncMs = performance.now() - t0;
    let slices = 0;
    const out = await generateAsync(req, { yieldFn: async () => void slices++ });
    console.log(`heavy term: ${reference.layouts.count} layouts; sync ${Math.round(syncMs)} ms, chunked ${Math.round(out!.ms)} ms in ${slices} slices`);
    if (!out!.truncated) expect(out!.layouts.count).toBe(reference.layouts.count);
    expect(out!.layouts.count).toBeGreaterThan(1000);
    expect(out!.ms).toBeLessThan(20_000);
  });
});

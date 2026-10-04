// Biological Sciences Major at Shady Grove (Physiology and Neurobiology only), 2026-27 UMD Academic Catalog
// (fetched 2026-09-28). Source: program-sources/universities-shady-grove-biological-sciences.md.
// Starts from the College Park PHNB track and changes only the rows the Shady Grove table differs on.
// Encoded by hand. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta, Requirement } from "../src/audit.ts";
import { bsciMajorPhnb } from "./bsci-major-phnb-2026-27.ts";

const CATALOG = "https://academiccatalog.umd.edu/undergraduate/colleges-schools/universities-shady-grove/biological-sciences/";
const DEPT = "https://shadygrove.umd.edu/academics/degree-programs/bs-biological-sciences";

// "Physiology and Neurobiology | 11" list, plus the special-topics and honors-seminar rows (footnotes 5 and 6).
const USG_AREA = [
  "BSCI355", "BSCI360", "BSCI370", "BSCI374", "BSCI401", "BSCI402", "BSCI403", "BSCI406", "BSCI407", "BSCI410", "BSCI414",
  "BSCI416", "BSCI420", "BSCI421", "BSCI422", "BSCI423", "BSCI430", "BSCI433", "BSCI434", "BSCI442", "BSCI443", "BSCI446",
  "BSCI447", "BSCI452", "BSCI454", "BSCI462", "BSCI464", "BSCI465",
  "BSCI328", "BSCI338", "BSCI339", "BSCI348", "BSCI378H", "BSCI398H",
  "BIOM301", "STAT400", "STAT464",
];

const dropped = new Set(["bsci207", "freshman-seminar", "math-sequence", "phys131", "phys132", "bsci331", "bsci332", "phnb-area-credits", "phnb-lab-min"]);
const kept: Requirement[] = bsciMajorPhnb.requirements.filter((r) => !dropped.has(r.id));

export const bsciUsgMajor: Program = {
  ...bsciMajorPhnb,
  id: "bsci-usg-major",
  name: "Biological Sciences Major at Shady Grove (Physiology and Neurobiology)",
  source: `UMD Academic Catalog 2026-27, Biological Sciences Major at Shady Grove, ${CATALOG}; ${DEPT} (fetched 2026-09-28)`,
  reviewNotes: [
    "Shady Grove offers only the Physiology and Neurobiology specialization; built from bsci-major-phnb with the differences below.",
    "Basic Program: the Shady Grove table lists BSCI223 General Microbiology (4 credits), added. It lists no BSCI207 and no freshman seminar (source lines 'BSCI223 | General Microbiology | 4'; the Basic Program list), so both are removed. Lower-level courses are expected from transfer credit (footnote 1).",
    "Math: 'MATH130 or MATH140' and 'MATH131 or MATH141'; the College Park MATH135/MATH136 pairings are not in this table, so the math rows are two separate 'or' rows.",
    "Physics: 'PHYS131 or PHYS331' and 'PHYS132 or PHYS332' (source lines under 'Courses taken at the Universities at Shady Grove').",
    "Biology lab: 'BSCI180 (BSCI171 and BSCI161 may count for BSCI180)' matches the College Park biology-lab encoding, kept as is.",
    "Chemistry: footnote 2 says a General Chemistry II lab may substitute for CHEM272 for students accepted to Shady Grove Biological Sciences. No course code is given, so this is a manual note: CHEM272 stays required in the audit.",
    "Advanced Program: 'BSCI331 & BSCI332 (BSCI330 may count for BSCI331 & BSCI332)' is encoded as either the pair or BSCI330. Required courses (BCHM461 or BCHM463, BSCI353, BSCI450) are unchanged.",
    "Advanced Program 'Physiology and Neurobiology | 11' is an 11-credit pool over the Shady Grove list, which differs from College Park's lecture/lab list (it includes BSCI407, BSCI421, BSCI434, BSCI454, BSCI462, BSCI464, BSCI465 and the special-topics and honors-seminar courses BSCI328/338/339/348/378H/398H; no lab minimum is stated, so the College Park at-least-one-lab overlay is dropped). Special-topics rows are listed by base course number, so any section counts; the specific section topics named in the source are not enforced. 'Statistics, one course maximum' (BIOM301, STAT400, STAT464) is in the pool but the one-course cap is not enforced. BSCI402, BSCI421, BSCI434 and BSCI465 appear in the source with no title.",
    "Enrichment (3 credits from 300/400-level BSCI, CHEM or BCHM) is unchanged.",
    "Electives (22 credits) are general electives and are not encoded; the 96-credit total, the 27-credit advanced program total and General Education are manual checks.",
    ...(bsciMajorPhnb.reviewNotes ?? []).filter((n) => n.startsWith("Not encoded (engine gap")),
  ],
  requirements: [
    ...kept.slice(0, 4),
    { kind: "course", id: "bsci223", name: "General Microbiology", options: ["BSCI223"] },
    ...kept.slice(4),
    { kind: "course", id: "math-calc-1", name: "Calculus I", options: ["MATH130", "MATH140"] },
    { kind: "course", id: "math-calc-2", name: "Calculus II", options: ["MATH131", "MATH141"] },
    { kind: "course", id: "phys131", name: "Physics I", options: ["PHYS131", "PHYS331"] },
    { kind: "course", id: "phys132", name: "Physics II", options: ["PHYS132", "PHYS332"] },
    { kind: "sets", id: "cell-bio-physiology", name: "Cell Biology & Physiology (with lab)", options: [["BSCI331", "BSCI332"], ["BSCI330"]] },
    { kind: "choose", id: "phnb-area-credits", name: "Physiology and Neurobiology (11 credits)", credits: 11, from: { courses: USG_AREA } },
  ],
};

export const bsciUsgMajorMeta: ProgramMeta = {
  kind: "major",
  college: "USG",
  short: "Biological Sciences (Shady Grove)",
  sources: { catalog: CATALOG, department: DEPT },
};

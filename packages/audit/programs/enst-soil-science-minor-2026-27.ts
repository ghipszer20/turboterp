// Soil Science Minor, 2026–27 UMD Academic Catalog (Department of Environmental Science and Technology).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/environmental-science-technology/soil-science-minor/
// and https://enst.umd.edu/ (both fetched 2026-09-28).
// No official published sample plan (built from the requirements below; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const GROUP_A = ["ENST411", "ENST414", "ENST417", "ENST421", "ENST422"];
const GROUP_B = ["ENST301", "ENST302", "ENST303", "ENST309", "ENST423", "ENST430"];

export const enstSoilScienceMinor: Program = {
  id: "enst-soil-science-minor",
  name: "Soil Science Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Soil Science Minor; Department of Environmental Science and Technology, " +
    "https://enst.umd.edu/ (fetched 2026-09-28)",
  verified: false,
  reviewNotes: [
    "Department page (enst.umd.edu) is a homepage with no requirements (it announces the new Chesapeake Bay minor only); encoded from the catalog. Department page not checked for requirements.",
    "ENST200 (4 credits) plus 13 credits from Group A (ENST411, 414, 417, 421, 422) and Group B (ENST301, 302, 303, 309, 423, 430), at least two courses from Group A. Encoded as one 13-credit choose over both groups plus an overlay requiring two Group A courses.",
    "Catalog sets no minimum grade or GPA for the minor; none is enforced. No sharing cap stated; none is set.",
    "Not encoded (prerequisite advice): students need MATH113 or higher and a 4-credit CHEM prerequisite; total 17-24 credits depending on prerequisites.",
  ],
  requirements: [
    { kind: "course", id: "enst200", name: "Fundamentals of Soil Science", options: ["ENST200"] },
    {
      kind: "choose",
      id: "groups-a-b",
      name: "13 credits from Group A and Group B",
      credits: 13,
      from: { courses: [...GROUP_A, ...GROUP_B] },
    },
    {
      kind: "choose",
      id: "group-a",
      name: "At least two courses from Group A (Underlying Principles)",
      overlay: true,
      count: 2,
      from: { courses: GROUP_A },
    },
  ],
};

export const enstSoilScienceMinorMeta: ProgramMeta = { kind: "minor", college: "AGNR", short: "Soil Science Minor", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/environmental-science-technology/soil-science-minor/", department: "https://enst.umd.edu/" } };

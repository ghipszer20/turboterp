// Communication Major at the Universities at Shady Grove, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/universities-shady-grove/communication/ and
// shadygrove.umd.edu/academics/degree-programs/ba-communication (both fetched 2026-09-28); see
// program-sources/communication.md. A different curriculum from the College Park Communication major
// (Applied lists differ, Diversity & Inclusion adds COMM398); rows identical to College Park's are reused
// from comm-shared-2026-27.ts, the rest are written here.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta, SetMember } from "../src/audit.ts";
import { commCollegeRequirements, commResearchMethods, commLeadershipSocialChange } from "./comm-shared-2026-27.ts";

/** Applied: two pick-ones whose lists overlap (COMM330, 386, 388, 425, 455). One `sets` option with
 * two members, so a course counts toward one member only and can't fill both picks. */
const appliedMembers: SetMember[] = [
  { count: 1, from: { courses: ["COMM386", "COMM388", "COMM498"] } },
  {
    count: 1,
    from: {
      courses: [
        "COMM330", "COMM331", "COMM370", "COMM371", "COMM375", "COMM386", "COMM388", "COMM425", "COMM426",
        "COMM455",
      ],
    },
  },
];

export const commUsgMajor: Program = {
  id: "comm-usg-major",
  name: "Communication Major at Shady Grove",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Communication Major at the Universities at Shady Grove " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/universities-shady-grove/communication/); " +
    "Shady Grove department page (https://shadygrove.umd.edu/academics/degree-programs/ba-communication), fetched 2026-09-28",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "The Shady Grove department page says the B.A. is 'the Communication Studies track, with a specialization in Media and Digital Communication' but lists no courses, so the catalog curriculum is encoded. The catalog table resembles College Park's Communication Studies track (two of COMM201/301/302/303; 12 credits of unnamed 3xx/4xx COMM electives; same Leadership & Social Change list) and has NONE of the Media and Digital Communication track's named Specialization Electives or its fixed COMM303. The specialization claim cannot be verified from the sources; flagged for the owner.",
    "Differences from College Park's Communication rows: Diversity & Inclusion also lists COMM398 (COMM398B, Communication, Culture & Sport); the first Applied list is COMM386/388/498 (College Park: COMM311/386/388) and the second Applied list has no COMM311. College Requirements, Research Methods and Leadership & Social Change match College Park exactly and are reused from comm-shared.",
    "COMM420, COMM421, COMM436, COMM454 and COMM455 appear in the source with no course title; kept in their pools literally and not used in the sample plan.",
    "Applied's two pick-ones overlap (COMM330, 386, 388, 425, 455); they are one `sets` requirement so one course cannot fill both picks. COMM330, 425 and 455 also appear in Leadership & Social Change and COMM386/388 etc. could also be chosen as electives; the engine assigns each course to one requirement.",
    "The 12 credits of '3xx or 4xx-Level COMM Electives' name no list; encoded as four COMM 300-499 courses excluding COMM304 (separately required), as in the College Park tracks.",
    "Not encoded (manual): 'Only 3 credits of COMM386 may apply toward the major' (an at-most cap; COMM386 could otherwise be chosen in Applied and again as an elective); the Undergraduate Director may approve other appropriate Communication courses; admission (transfer only, associate degree or at least 45 transferable credits); 2.0 major GPA; the 46-credit total; residency.",
    "No four-year plan in the sources (the catalog links only to roadmaps); the sample plan is constructed. Department page checked but has no requirements table.",
  ],
  requirements: [
    ...commCollegeRequirements,
    {
      kind: "choose",
      id: "theory-principles-choice",
      name: "Communication Theory & Principles: two of the following",
      count: 2,
      from: { courses: ["COMM201", "COMM301", "COMM302", "COMM303"] },
    },
    ...commResearchMethods,
    commLeadershipSocialChange,
    {
      kind: "choose",
      id: "society-diversity-inclusion",
      name: "Diversity & Inclusion: one course",
      count: 1,
      from: { courses: ["COMM324", "COMM360", "COMM382", "COMM398", "COMM454", "COMM460"] },
    },
    { kind: "sets", id: "applied", name: "Applied: two courses (one from each list)", options: [appliedMembers] },
    {
      kind: "choose",
      id: "usg-electives",
      name: "3xx or 4xx-Level COMM Electives (12 credits)",
      count: 4,
      from: { departments: ["COMM"], minNumber: 300, maxNumber: 499, exclude: ["COMM304"] },
    },
  ],
};

export const commUsgMajorMeta: ProgramMeta = {
  kind: "major",
  college: "USG",
  short: "Communication (Shady Grove)",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/universities-shady-grove/communication/",
    department: "https://shadygrove.umd.edu/academics/degree-programs/ba-communication",
  },
};

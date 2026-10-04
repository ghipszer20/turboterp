// Actuarial: SOA Validation by Educational Experience (VEE). Source: Society of Actuaries VEE page,
// as reported by a fetch summary in docs/project/new-tracks-research.md section 13 (S). The SOA's
// approved-course directory was not visible. UNVERIFIED until the owner signs off.

import type { Track } from "../src/types.ts";
import { cat, sets } from "./common.ts";

const SOA = "https://www.soa.org/education/exam-req/edu-VEE/";

export const actuarialVee: Track = {
  id: "actuarial-vee",
  name: "Actuarial (SOA VEE)",
  schools: "the Society of Actuaries",
  entry: { kind: "after-degree" },
  categories: [
    cat(sets("economics", "Economics", [["ECON200", "ECON201"]]), "VEE topic: Economics (SOA)"),
    cat(sets("accounting-finance", "Accounting and finance", [["BMGT220", "BMGT340"]]), "VEE topic: Accounting and Finance (SOA)"),
    cat(
      sets("mathematical-statistics", "Mathematical statistics", [["STAT400", "STAT401"], ["STAT400", "STAT410"]]),
      "VEE topic: Mathematical Statistics (SOA)",
    ),
  ],
  milestones: [
    {
      id: "exam-p",
      kind: "exam",
      name: "SOA Exam P (Probability)",
      detail: "Candidates must pass two SOA, CAS or CIA actuarial exams before applying for VEE credit. Exams P and FM usually come first.",
    },
    {
      id: "exam-fm",
      kind: "exam",
      name: "SOA Exam FM (Financial Mathematics)",
      detail: "The second of the two exams to pass before applying for VEE credit.",
    },
    {
      id: "soa-directory",
      kind: "advising",
      name: "Confirm courses in the SOA VEE directory",
      detail: "The SOA keeps a directory of pre-approved courses for each VEE topic, with grade minimums. Check that your UMD course and semester are listed before relying on it.",
    },
  ],
  disclaimer: "Confirm with the Society of Actuaries and each target school.",
  sources: [SOA],
  verified: false,
  reviewNotes: [
    "(S) The three VEE topics (Economics, Accounting and Finance, Mathematical Statistics) and the two-exam prerequisite come from a fetch summary of the SOA page, not a full read.",
    "Candidate UMD courses are the research doc's, and the doc could not confirm which are SOA-approved: confirm in the SOA VEE directory before setting verified: true. Economics ECON200 + ECON201; Accounting and Finance BMGT220 + BMGT340; Mathematical Statistics STAT400 + STAT401 (or STAT410).",
    "Grade minimums live in the SOA directory and were not visible, so no minimum grade is set. There is no GPA requirement.",
    "STAT401, STAT410 and BMGT340 are not in the Spring 2027 schedule fixture; they were added from the research doc alone (credits assumed 3).",
    "No science GPA: this is a professional credential, not a health track. It is credit-by-course, not admission.",
  ],
};

// Pre-Art Therapy. Source: AATA "Becoming an art therapist" page and ACATE/CAAHEP standards
// (SOURCES.md, docs/project/new-tracks-research.md section 8, marked (S)). Encoded by hand. UNVERIFIED
// until the owner signs off.

import type { Track } from "../src/types.ts";
import { abnormalPsych, cat, developmentalPsych, generalPsych } from "./common.ts";

const AATA = "https://arttherapy.org/becoming-art-therapist/";

export const preArtTherapy: Track = {
  id: "pre-art-therapy",
  name: "Pre-Art Therapy",
  schools: "art therapy master's programs",
  entry: { kind: "after-degree" },
  categories: [
    cat(
      {
        kind: "choose",
        id: "studio-art",
        name: "Studio art (drawing, painting, three-dimensional)",
        credits: 18,
        from: { courses: ["ARTT100", "ARTT110", "ARTT200", "ARTT210", "ARTT255", "ARTT320"] },
      },
      "Foundational studio art (drawing, painting, digital art, clay or sculpture); about 18 semester hours",
    ),
    generalPsych("Psychology"),
    abnormalPsych("A prerequisite course in abnormal psychology"),
    developmentalPsych("A prerequisite course in developmental psychology"),
  ],
  milestones: [
    {
      id: "graduate-degree",
      kind: "application",
      name: "Master's degree",
      detail: "AATA: a master's degree is necessary for entry-level practice. Standards are set by ACATE/CAAHEP; each program adds its own prerequisites, so check each target program.",
    },
  ],
  disclaimer: "Confirm with your academic advisor and each target school.",
  sources: [AATA],
  verified: false,
  reviewNotes: [
    "(S) Studio art credits: about 18 semester hours (drawing, painting, three-dimensional) come from search summaries of program sources, not from AATA's page. Verify against ACATE's Educational Standards before signing off. Encoded as 18 credits from ARTT100, ARTT110, ARTT200, ARTT210, ARTT255 and ARTT320 (the research doc's list), which with three-credit courses means all six.",
    "(S) Psychology credits: about 12 semester hours of psychology also comes from program sources, not AATA. It is not encoded as a total: the audit can't count one course toward both a total and the named categories. The named categories (general, abnormal, developmental psychology) are the AATA-stated part.",
    "AATA's own wording (page read, not a summary): studio art, and \"a prerequisite course in ... developmental psychology and also abnormal psychology\".",
    "Abnormal psychology = PSYC353 or PSYC330 and developmental psychology = PSYC355, the same shared mappings the OT and PA tracks use. Whether a general psychology course (PSYC100) is required is a program norm in the research doc, so it is included as a category.",
    "UMD course titles are known only for ARTT110 (Elements of Drawing I), ARTT200 (Three-Dimensional Art Fundamentals) and ARTT320 (Elements of Painting); the others come from the research doc's list without titles.",
    "No science GPA is shown and no minimum grade is encoded: AATA states neither.",
    "The disclaimer names the student's advisor rather than HPAO because no HPAO page covers this track.",
  ],
};

// Hand-classified labs for departments M–Z (lab-pairs-a-l.ts has A–L), from the UMD text in
// program-sources/labs.md. See lab-pairs.ts.
import type { LabPair, StandaloneLab, StandaloneRule } from "./lab-pairs.ts";

const T7 = "Testudo Schedule of Classes, 202701";
const T8 = "Testudo Schedule of Classes, 202608";
const CAT = "UMD catalog, https://academiccatalog.umd.edu/";

export const PAIRS: LabPair[] = [
  {
    lecture: "NFSC430",
    labs: ["NFSC434"],
    source: `${T7}: NFSC434 prerequisite 'Must have completed or be concurrently enrolled in NFSC430.'`,
  },
  {
    lecture: "NFSC421",
    labs: ["NFSC423"],
    source: `${T8}: NFSC423 prerequisite 'Must have completed or be concurrently enrolled in NFSC421.'`,
  },
  {
    lecture: "PLSC201",
    labs: ["PLSC206"],
    source: `${T8}: PLSC206 description 'hands-on experience for students who are concurrently taking PLSC201'`,
  },
];

export const STANDALONE: StandaloneLab[] = [
  { id: "NAVY108", reason: "naval science leadership lab; self-contained", source: `${T7}: NAVY108 listing` },
  { id: "NEUR405", reason: "upper-level lab; prerequisites finished first", source: `${T7}: NEUR405 prerequisite 'NEUR306 or BSCI353'` },
  { id: "PHYS174", reason: "lab introduction; its corequisite is MATH140 (calculus), not a physics lecture", source: `${T7}: PHYS174 corequisite 'MATH140.'` },
  { id: "PHYS276", reason: "prerequisites PHYS272 and PHYS275 finished first", source: `${T7}: PHYS276 listing` },
  { id: "PHYS405", reason: "advanced lab; prerequisite PHYS375 finished first", source: `${T7}: PHYS405 listing` },
  { id: "PSYC200", reason: "statistics course that meets as a lab; self-contained", source: `${T7}: PSYC200 listing` },
  { id: "PSYC300", reason: "research methods lab; prerequisite PSYC200 finished first", source: `${T7}: PSYC300 listing` },
  { id: "PSYC420", reason: "social psychology lab; prerequisites finished first", source: `${T7}: PSYC420 listing` },
  { id: "PSYC450", reason: "I/O psychology lab; prerequisite PSYC300 finished first", source: `${T7}: PSYC450 listing` },
  { id: "PSYC629", reason: "graduate clinical practicum; no lecture partner", source: `${CAT}graduate/courses/psyc/: PSYC629 listing` },
  { id: "PSYC629B", reason: "graduate clinical practicum; no lecture partner", source: `${T7}: PSYC629B listing` },
  { id: "PSYC629D", reason: "graduate clinical practicum; no lecture partner", source: `${T7}: PSYC629D listing` },
  { id: "PSYC629C", reason: "graduate clinical practicum; no lecture partner", source: `${T8}: PSYC629C listing` },
  { id: "PSYC629F", reason: "graduate clinical practicum; no lecture partner", source: "Testudo Schedule of Classes, 202605: PSYC629F listing" },
  { id: "PSYC629G", reason: "graduate clinical practicum; no lecture partner", source: "Testudo Schedule of Classes, 202512: PSYC629G listing" },
  { id: "SOCY201", reason: "statistics course that meets as a lab; self-contained", source: `${T7}: SOCY201 listing` },
  { id: "SOCY202", reason: "research methods course that meets as a lab; self-contained", source: `${T7}: SOCY202 listing` },
  { id: "NFSC463", reason: "sensory evaluation lab; prerequisites finished first", source: `${T8}: NFSC463 listing` },
  { id: "PSYC407", reason: "behavioral neurobiology lab; prerequisites finished first", source: `${T8}: PSYC407 listing` },
  { id: "SPHL358", reason: "Gymkana Troupe performance group; self-contained", source: `${T8}: SPHL358 listing` },
  { id: "NFSC413", reason: "fermentation lab; prerequisites finished first", source: "Testudo Schedule of Classes, 202601: NFSC413 listing" },
  { id: "PHYS429", reason: "atomic and nuclear lab; prerequisite PHYS405 finished first", source: `${CAT}undergraduate/approved-courses/phys/: PHYS429 listing` },
  { id: "PSYC401", reason: "biological bases lab; prerequisites finished first", source: `${CAT}undergraduate/approved-courses/psyc/: PSYC401 listing` },
  { id: "MIEH722", reason: "graduate lab methods course; no lecture partner", source: `${CAT}graduate/courses/mieh/: MIEH722 listing` },
  { id: "MOCB699", reason: "graduate lab rotation; research", source: `${CAT}graduate/courses/mocb/: MOCB699 listing` },
];

export const RULES: StandaloneRule[] = [
  {
    prefix: "MUSC",
    reason: "music ensembles and workshops meet as labs; no separate lecture",
    source: `${T7}: every MUSC course meeting as lab only is an Ensemble (MUSC129, 229, 329, 629, 649) or Opera Workshop`,
  },
  {
    prefix: "THET",
    reason: "theatre acting, design and studio courses meet as labs; no separate lecture",
    source: `${T7}: every THET course meeting as lab only is an acting, design, drafting, rendering or studio course`,
  },
];

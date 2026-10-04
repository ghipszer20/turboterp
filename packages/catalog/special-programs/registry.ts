// Every living-learning program (LLP) and special program found on UMD's own
// sites (see SOURCES.md), with how each was drafted. None is a catalog
// requirement table: they are hand-transcribed from prose pages and PDFs, or
// not drafted, with the reason.

import type { Program } from "@turboterp/audit";
import { honorsAces } from "./honors-aces-2026-27.ts";
import { honorsDcc } from "./honors-dcc-2026-27.ts";
import { honorsGemstone } from "./honors-gemstone-2026-27.ts";
import { honorsHglo } from "./honors-hglo-2026-27.ts";
import { honorsHumanities } from "./honors-humanities-2026-27.ts";
import { honorsIbh } from "./honors-ibh-2026-27.ts";
import { honorsIls } from "./honors-ils-2026-27.ts";
import { honorsUh } from "./honors-uh-2026-27.ts";
import { deptAero } from "./dept-aero-2026-27.ts";
import { deptAmst } from "./dept-amst-2026-27.ts";
import { deptAnth } from "./dept-anth-2026-27.ts";
import { deptArt } from "./dept-art-2026-27.ts";
import { deptArth } from "./dept-arth-2026-27.ts";
import { deptBioe } from "./dept-bioe-2026-27.ts";
import { deptBiol } from "./dept-biol-2026-27.ts";
import { deptCbmg } from "./dept-cbmg-2026-27.ts";
import { deptCcjs } from "./dept-ccjs-2026-27.ts";
import { deptChem } from "./dept-chem-2026-27.ts";
import { deptComm } from "./dept-comm-2026-27.ts";
import { deptEcon } from "./dept-econ-2026-27.ts";
import { deptEng } from "./dept-eng-2026-27.ts";
import { deptEngl } from "./dept-engl-2026-27.ts";
import { deptEnsp } from "./dept-ensp-2026-27.ts";
import { deptEntm } from "./dept-entm-2026-27.ts";
import { deptGeol } from "./dept-geol-2026-27.ts";
import { deptGers } from "./dept-gers-2026-27.ts";
import { deptGvpt } from "./dept-gvpt-2026-27.ts";
import { deptHesp } from "./dept-hesp-2026-27.ts";
import { deptHist } from "./dept-hist-2026-27.ts";
import { deptKnes } from "./dept-knes-2026-27.ts";
import { deptMath } from "./dept-math-2026-27.ts";
import { deptNeur } from "./dept-neur-2026-27.ts";
import { deptPhys } from "./dept-phys-2026-27.ts";
import { deptPsyc } from "./dept-psyc-2026-27.ts";
import { deptSpan } from "./dept-span-2026-27.ts";
import { deptWgss } from "./dept-wgss-2026-27.ts";
import { carillon } from "./llp-carillon-2026-27.ts";
import { flexus, virtus } from "./llp-flexus-virtus-2026-27.ts";
import { languageHouse } from "./llp-language-house-2026-27.ts";
import { writersHouse } from "./llp-writers-house-2026-27.ts";
import { scholarsArts } from "./scholars-arts-2026-27.ts";
import { scholarsBse } from "./scholars-bse-2026-27.ts";
import { scholarsCesg } from "./scholars-cesg-2026-27.ts";
import { scholarsDj } from "./scholars-dj-2026-27.ts";
import { scholarsEte } from "./scholars-ete-2026-27.ts";
import { scholarsGph } from "./scholars-gph-2026-27.ts";
import { scholarsIs } from "./scholars-is-2026-27.ts";
import { scholarsJlt } from "./scholars-jlt-2026-27.ts";
import { scholarsLs } from "./scholars-ls-2026-27.ts";
import { scholarsMedia } from "./scholars-media-2026-27.ts";
import { scholarsPl } from "./scholars-pl-2026-27.ts";
import { scholarsSgc } from "./scholars-sgc-2026-27.ts";
import { scholarsSts } from "./scholars-sts-2026-27.ts";
import { fire } from "./special-fire-2026-27.ts";
import { umdFellows } from "./special-umd-fellows-2026-27.ts";

export type SpecialKind = "scholars" | "honors" | "llp" | "special" | "departmental";

/** hand: transcribed into a Program; none: not drafted (why says so). No LLP page is a catalog table. */
export type Drafting = "hand" | "none";

export type SpecialEntry = {
  name: string;
  kind: SpecialKind;
  /** The page (or PDF) stating the requirements, or the program's main page when there is none. */
  source: string;
  drafting: Drafting;
  program?: Program;
  /** Why nothing is drafted. */
  why?: string;
};

const hand = (kind: SpecialKind, program: Program): SpecialEntry => ({
  name: program.name,
  kind,
  source: program.source!,
  drafting: "hand",
  program,
});

const none = (kind: SpecialKind, name: string, source: string, why: string): SpecialEntry => ({ name, kind, source, drafting: "none", why });

const UGST_CATALOG = "https://academiccatalog.umd.edu/undergraduate/colleges-schools/undergraduate-studies/";

export const specialPrograms: SpecialEntry[] = [
  // College Park Scholars (13 programs)
  ...[
    scholarsArts, scholarsBse, scholarsCesg, scholarsDj, scholarsEte, scholarsGph, scholarsIs,
    scholarsJlt, scholarsLs, scholarsMedia, scholarsPl, scholarsSgc, scholarsSts,
  ].map((p) => hand("scholars", p)),

  // Honors College living-learning programs (8)
  ...[honorsAces, honorsDcc, honorsGemstone, honorsHglo, honorsHumanities, honorsIls, honorsIbh, honorsUh].map((p) => hand("honors", p)),

  // Other living-learning programs
  hand("llp", carillon),
  hand("llp", flexus),
  hand("llp", virtus),
  hand("llp", writersHouse),
  hand("llp", languageHouse),
  none(
    "llp",
    "BioFIRE",
    "https://cmns.umd.edu/undergraduate/future-students/living-learning-special-programs/biofire",
    "No course ids or completion requirements are published: the page says only \"Enroll in a one-credit fall and spring seminar\" and take first-year science courses with the cohort.",
  ),

  // Other special programs
  hand("special", fire),
  hand("special", umdFellows),
  none(
    "special",
    "Persian Flagship Program",
    "https://sllc.umd.edu/special-programs/arabic-persian/persian-flagship",
    "No public requirements page: the program pages describe the Language Flagship, funding and a capstone, but list no required courses or credits.",
  ),
  none(
    "special",
    "Southern Management Leadership Program",
    "https://www.smlp.umd.edu/",
    "No stated program requirements: the catalog describes SMLP470–SMLP474 as courses restricted to the program but never says which are required.",
  ),
  none(
    "special",
    "Air Force ROTC",
    UGST_CATALOG,
    "Commissioning program whose requirements are set by the Air Force; the catalog lists no course requirements beyond the Leadership Laboratory (ARSC059) and cadet standards.",
  ),
  none(
    "special",
    "Army ROTC",
    UGST_CATALOG,
    "Commissioning program; its academic part (ARMY301, ARMY302, ARMY401, ARMY402 and military history) is the catalog's Army Leadership Studies minor, which the catalog pipeline drafts.",
  ),
  none(
    "special",
    "Naval ROTC",
    UGST_CATALOG,
    "Commissioning program; the catalog gives sample plans (\"Navy Option students typically will take\") and requirement categories (calculus, physics, English) rather than a course list. The Naval Science minor is drafted by the catalog pipeline.",
  ),
  none(
    "special",
    "C.D. Mote Jr. Incentive Awards Program",
    UGST_CATALOG,
    "A scholarship and mentoring program with no academic course requirements.",
  ),

  // Departmental honors programs (see honors.umd.edu/academics/departmental-honors/ for the department directory)
  hand("departmental", deptAero),
  hand("departmental", deptAmst),
  hand("departmental", deptAnth),
  hand("departmental", deptArt),
  hand("departmental", deptArth),
  hand("departmental", deptBioe),
  hand("departmental", deptBiol),
  hand("departmental", deptCbmg),
  hand("departmental", deptChem),
  hand("departmental", deptComm),
  hand("departmental", deptEcon),
  hand("departmental", deptEng),
  none(
    "departmental",
    "Departmental Honors: Electrical and Computer Engineering",
    "https://www.eng.umd.edu/current/honors-program",
    "ECE's own honors page (ece.umd.edu/undergraduate/current-students/honors-program) returns HTTP 403; the Clark School's directory of departmental honors contacts lists \"Electrical and Computer Engineering\" separately from \"Engineering,\" but ECE's undergraduate page links only to the Clark School's shared Engineering Honors Program (drafted as \"Departmental Honors: Engineering (Clark School)\"), which lists ENEE499 as ECE's research-course option.",
  ),
  hand("departmental", deptEngl),
  hand("departmental", deptEnsp),
  hand("departmental", deptEntm),
  hand("departmental", deptGeol),
  hand("departmental", deptGers),
  hand("departmental", deptGvpt),
  hand("departmental", deptHist),
  hand("departmental", deptKnes),
  hand("departmental", deptMath),
  hand("departmental", deptPhys),
  hand("departmental", deptPsyc),
  hand("departmental", deptSpan),
  hand("departmental", deptWgss),
  none(
    "departmental",
    "Departmental Honors: Astronomy",
    "https://www.astro.umd.edu/undergrad/major.html",
    "No course ids are published: the Departmental Honors Program section says only that \"Honors students work with a faculty advisor on a research project for academic credit,\" submit \"a written report,\" and pass \"an oral comprehensive examination.\"",
  ),
  none(
    "departmental",
    "Departmental Honors: Agriculture & Natural Resources",
    "https://agnr.umd.edu/academics/undergraduate-honors",
    "College-wide program with no drafteable course ids: \"Six or more credits in upper-level honors courses, seminars, or workshops\" from any department, plus \"Six or more credits of DEPARTMENTAL 388 Honors Thesis Research,\" where DEPARTMENTAL is a 4-letter prefix that varies by the student's own AGNR major (ANSC388, NFSC388, PLSC388, etc.) and isn't enumerated on the page.",
  ),
  none(
    "departmental",
    "Departmental Honors: Behavioral and Community Health",
    "https://sph.umd.edu/academics/departments-units/department-behavioral-and-community-health/student-resources-and-programs-behavioral-and-community-health/undergraduate-student-resources-community-health",
    "The Honors College directory links this URL for Behavioral and Community Health, but the page (an undergraduate resources page for the Public Health Practice major) has no honors program section, course ids or requirements.",
  ),
  hand("departmental", deptCcjs),
  none(
    "departmental",
    "Departmental Honors: Computer Science",
    "https://undergrad.cs.umd.edu/honors/requirements",
    "No enumerated course requirement: to graduate with the citation a student must have \"Completed a graduate level 'PhD Qualifying' CMSC course OR an honors version of a CMSC3xx/4xx course (not including CMSC396H)\" plus an approved honors thesis; neither the qualifying-course list nor the honors-version course ids are published, and CMSC499/CMSC396H research credit is explicitly \"not strictly required.\"",
  ),
  none(
    "departmental",
    "Departmental Honors: Family Health",
    "https://sph.umd.edu/academics/departments-units/department-family-science/student-resources-family-science/undergraduate-student-resources-family-health",
    "No course ids are published: \"Students enroll in special honors courses, complete honors option work in regular courses and conduct independent research,\" culminating in a senior honors thesis, but no course ids or credit totals are named.",
  ),
  none(
    "departmental",
    "Departmental Honors: French",
    "https://sllc.umd.edu/fields/french",
    "Unlike German and Spanish, SLLC publishes no dedicated honors-program page for French: the page the Honors College directory links to is the general French Program page, with no honors section, and no French-specific honors subpage was found from its links.",
  ),
  hand("departmental", deptHesp),
  none(
    "departmental",
    "Departmental Honors: Human Development",
    "https://education.umd.edu/human-development-honors-program",
    "No course ids are published: the page describes a \"two-year program sequence\" with \"an Honors seminar offered in the fall of the Junior year\" and senior-year thesis mentorship, but names no course ids and defers eligibility/application details to a separate overview page.",
  ),
  none(
    "departmental",
    "Departmental Honors: Linguistics",
    "https://linguistics.umd.edu/academic-programs/undergraduate/honors-programs",
    "No required course: a student finds a faculty supervisor and may \"optionally register for LING 499 ('Directed Studies')\"; there's no fixed, required course id and no other requirement beyond a thesis and its supervisor's recommendation.",
  ),
  hand("departmental", deptNeur),
  none(
    "departmental",
    "Departmental Honors: Philosophy",
    "https://philosophy.umd.edu/",
    "The Honors College directory links only the department's general homepage; it has no honors program section, and no dedicated Philosophy honors-program page was found from its navigation or links.",
  ),
  none(
    "departmental",
    "Departmental Honors: Sociology",
    "https://socy.umd.edu/undergraduate/honors-program",
    "No course ids are published (checked 2026-09-27): socy.umd.edu is reachable again, and the Honors College's departmental-honors directory links this same URL, but the page itself (last modified 2021) is prose-only — \"the opportunity to enroll in small seminars and graduate level courses and the opportunity to work on a one-to-one basis with faculty\" — with an eligibility GPA (\"a cumulative GPA of 3.3 and a GPA of 3.5 in Sociology\") but no SOCY course ids, credit counts or thesis requirement.",
  ),
];

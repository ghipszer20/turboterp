// Table test: graduation GPA rules encoded as Program.minGpa.
import { describe, expect, it } from "vitest";
import { agnrCert } from "../programs/agnr-cert-2026-27.ts";
import { arecGlobalPovertyMinor } from "../programs/arec-global-poverty-minor-2026-27.ts";
import { enspSustainabilityStudiesMinor } from "../programs/ensp-sustainability-studies-minor-2026-27.ts";
import { larcMajor } from "../programs/larc-major-2026-27.ts";
import { archConstructionProjectManagementMinor, archRealEstateDevelopmentMinor } from "../programs/arch-minors-2026-27.ts";
import { plcyMinorPublicLeadership, plcyMinorNonprofitLeadership } from "../programs/plcy-minors-2026-27.ts";
import { anscMajorAnimalCareManagement } from "../programs/ansc-major-animal-care-management-2026-27.ts";
import { anscMajorScienceProfessional } from "../programs/ansc-major-science-professional-2026-27.ts";
import { arecMajorAgResourceEcon } from "../programs/arec-major-ag-resource-econ-2026-27.ts";
import { arecMajorAgribusiness } from "../programs/arec-major-agribusiness-2026-27.ts";
import { arecMajorEnvironmentalResourceEcon } from "../programs/arec-major-environmental-resource-econ-2026-27.ts";
import { enstMajorAppliedEcologyNaturalResources } from "../programs/enst-major-applied-ecology-natural-resources-2026-27.ts";
import { enstMajorEcologicalTechnologyDesign } from "../programs/enst-major-ecological-technology-design-2026-27.ts";
import { enstMajorEcosystemHealth } from "../programs/enst-major-ecosystem-health-2026-27.ts";
import { enstMajorSoilWatershedScience } from "../programs/enst-major-soil-watershed-science-2026-27.ts";
import { acctMajor } from "../programs/acct-major-2026-27.ts";
import { finMajor } from "../programs/fin-major-2026-27.ts";
import { infsMajor } from "../programs/infs-major-2026-27.ts";
import { intbMajor } from "../programs/intb-major-2026-27.ts";
import { mgmtMajor } from "../programs/mgmt-major-2026-27.ts";
import { mktgMajor } from "../programs/mktg-major-2026-27.ts";
import { ombaMajor } from "../programs/omba-major-2026-27.ts";
import { scmMajor } from "../programs/scm-major-2026-27.ts";
import { amstMajor } from "../programs/amst-major-2026-27.ts";
import { arabMinor } from "../programs/arab-minor-2026-27.ts";
import { arthMajor } from "../programs/arth-major-2026-27.ts";
import { arthMinor } from "../programs/arth-minor-2026-27.ts";
import { arttMajorAdvancedSpecialization } from "../programs/artt-major-advanced-specialization-2026-27.ts";
import { arttMajorGraphicDesign } from "../programs/artt-major-graphic-design-2026-27.ts";
import { arttMajorStudio } from "../programs/artt-major-studio-2026-27.ts";
import { chinStudiesMinor } from "../programs/chin-minor-2026-27.ts";
import { clasMajorHumanities } from "../programs/clas-major-humanities-2026-27.ts";
import { clasMajorLatin } from "../programs/clas-major-latin-2026-27.ts";
import { clasMajorLatinGreek } from "../programs/clas-major-latin-greek-2026-27.ts";
import { clasMinorArchaeology, clasMinorGreek, clasMinorMythology } from "../programs/clas-minors-2026-27.ts";
import {
  dancMajorEducation,
  dancMajorPerformanceChoreography,
  dancMajorProduction,
} from "../programs/danc-major-2026-27.ts";
import { frenMajor } from "../programs/fren-major-2026-27.ts";
import { frenMinor } from "../programs/fren-minor-2026-27.ts";
import { gersMinor } from "../programs/germ-minor-2026-27.ts";
import { gersMajor } from "../programs/gers-major-2026-27.ts";
import { glbcMajor } from "../programs/glbc-major-2026-27.ts";
import { hebrMinor } from "../programs/hebr-minor-2026-27.ts";
import { histMajor } from "../programs/hist-major-2026-27.ts";
import { isrlMinor } from "../programs/isrl-minor-2026-27.ts";
import { italMajor } from "../programs/ital-major-2026-27.ts";
import { italMinor } from "../programs/ital-minor-2026-27.ts";
import { japnMajor } from "../programs/japn-major-2026-27.ts";
import { japnMinor } from "../programs/japn-minor-2026-27.ts";
import { koreMinor } from "../programs/kore-minor-2026-27.ts";
import { lingMinor } from "../programs/ling-minor-2026-27.ts";
import { mestMinor } from "../programs/mest-minor-2026-27.ts";
import { muscMinorCulture, muscMinorPerformance } from "../programs/musc-minors-2026-27.ts";
import { persMinor } from "../programs/pers-minor-2026-27.ts";
import { portMinor } from "../programs/port-minor-2026-27.ts";
import { ppeMajor } from "../programs/ppe-major-2026-27.ts";
import { russMajor } from "../programs/russ-major-2026-27.ts";
import { russMinor } from "../programs/russ-minor-2026-27.ts";
import { thetMajor } from "../programs/thet-major-2026-27.ts";
import { wgssMajor } from "../programs/wgss-major-2026-27.ts";
import { arabMajor } from "../programs/arab-major-2026-27.ts";
import { chinMajor } from "../programs/chin-major-2026-27.ts";
import { englMajorCreativeWriting } from "../programs/engl-major-creative-writing-2026-27.ts";
import { englMajorLanguageWritingRhetoric } from "../programs/engl-major-language-writing-rhetoric-2026-27.ts";
import { englMajorLiteraryCulturalStudies } from "../programs/engl-major-literary-cultural-studies-2026-27.ts";
import { englMajorMediaStudies } from "../programs/engl-major-media-studies-2026-27.ts";
import { imdmMajorComputing } from "../programs/imdm-major-computing-2026-27.ts";
import { imdmMajorEmergingCreatives } from "../programs/imdm-major-emerging-creatives-2026-27.ts";
import { lingMajorGrammarsCognition } from "../programs/ling-major-grammars-cognition-2026-27.ts";
import { lingMajorLanguage } from "../programs/ling-major-language-2026-27.ts";
import { romlMajorFrenchItalian } from "../programs/roml-major-french-italian-2026-27.ts";
import { romlMajorFrenchSpanish } from "../programs/roml-major-french-spanish-2026-27.ts";
import { romlMajorItalianSpanish } from "../programs/roml-major-italian-spanish-2026-27.ts";
import { spanMajorLanguageCultureProfessionalContexts } from "../programs/span-major-language-culture-professional-contexts-2026-27.ts";
import { spanMajorLinguisticsCultureEducation } from "../programs/span-major-linguistics-culture-education-2026-27.ts";
import { spanMajorLiteratureCultureMedia } from "../programs/span-major-literature-culture-media-2026-27.ts";
import { aaasMajorPublicPolicy } from "../programs/aaas-major-public-policy-2026-27.ts";
import { econMajorBa } from "../programs/econ-major-ba-2026-27.ts";
import { econMajorBs } from "../programs/econ-major-bs-2026-27.ts";
import { geogMajorCeos } from "../programs/geog-major-ceos-2026-27.ts";
import { geogMajorGds } from "../programs/geog-major-gds-2026-27.ts";
import { geogMajorGeneral } from "../programs/geog-major-general-2026-27.ts";
import { gtstMinor } from "../programs/gtst-minor-2026-27.ts";
import { gvptMinorIdcm } from "../programs/gvpt-minor-idcm-2026-27.ts";
import { hespMinor } from "../programs/hesp-minor-2026-27.ts";
import { neurMinor } from "../programs/neur-minor-2026-27.ts";
import { psycMajorBa } from "../programs/psyc-major-ba-2026-27.ts";
import { socyMajor } from "../programs/socy-major-2026-27.ts";
import { survMinor } from "../programs/surv-minor-2026-27.ts";

import { bsciMajorCebg } from "../programs/bsci-major-cebg-2026-27.ts";
import { bsciMajorEcev } from "../programs/bsci-major-ecev-2026-27.ts";
import { bsciMajorGenb } from "../programs/bsci-major-genb-2026-27.ts";
import { bsciMajorMicb } from "../programs/bsci-major-micb-2026-27.ts";
import { bsciMajorPhnb } from "../programs/bsci-major-phnb-2026-27.ts";
import { chemMajorBa } from "../programs/chem-major-ba-2026-27.ts";
import { chemMajorBs } from "../programs/chem-major-bs-2026-27.ts";
import { geolMinorGeophysics, geolMinorHydrology, geolMinorSurficialGeology, paleobiologyMinor, planetarySciencesMinor } from "../programs/geol-minors-2-2026-27.ts";
import { mathMajorTraditional } from "../programs/math-major-2026-27.ts";
import { mathMajorApplied } from "../programs/math-major-applied-2026-27.ts";
import { mathMinor, mathMinorActuarial, statisticsMinor } from "../programs/math-minors-2026-27.ts";
import { rasMinor } from "../programs/ras-minor-2026-27.ts";
import { aeroMajorAeronautical } from "../programs/aero-major-aeronautical-2026-27.ts";
import { aeroMajorAstronautical } from "../programs/aero-major-astronautical-2026-27.ts";
import { biocompMajor } from "../programs/biocomp-major-2026-27.ts";
import { engrMinorQuantum } from "../programs/engr-minors-2026-27.ts";

const programs = [
  amstMajor, arabMinor, arthMajor, arthMinor, arttMajorAdvancedSpecialization, arttMajorGraphicDesign,
  arttMajorStudio, chinStudiesMinor, clasMajorHumanities, clasMajorLatin, clasMajorLatinGreek,
  clasMinorArchaeology, clasMinorGreek, clasMinorMythology, dancMajorEducation,
  dancMajorPerformanceChoreography, dancMajorProduction, frenMajor, frenMinor, gersMinor, gersMajor, glbcMajor,
];

describe("program GPA rules (ARHU part A)", () => {
  it("encodes the stated graduation GPA per program", () => {
    expect(programs.map((p) => [p.id, p.minGpa]).sort()).toEqual(
      [
        ["amst-major", 2.0], ["arab-minor", 2.0], ["arth-major", 2.0], ["arth-minor", 2.0],
        ["artt-major-advanced-specialization", 2.0], ["artt-major-graphic-design", 2.0],
        ["artt-major-studio", 2.0], ["chin-minor-studies", 2.0], ["clas-major-humanities", 2.0],
        ["clas-major-latin", 2.0], ["clas-major-latin-greek", 2.0], ["clas-minor-archaeology", 2.0],
        ["clas-minor-greek", 2.0], ["clas-minor-mythology", 2.0], ["danc-major-education", 2.0],
        ["danc-major-performance-choreography", 2.0], ["danc-major-production", 2.0],
        ["fren-major", 2.0], ["fren-minor", 2.0], ["gers-minor", 2.0], ["gers-major", 2.0], ["glbc-major", 2.0],
      ].sort(),
    );
  });
});

const partB = [
  hebrMinor,
  histMajor,
  isrlMinor,
  italMajor,
  italMinor,
  japnMajor,
  japnMinor,
  koreMinor,
  lingMinor,
  mestMinor,
  muscMinorCulture,
  muscMinorPerformance,
  persMinor,
  portMinor,
  ppeMajor,
  russMajor,
  russMinor,
  thetMajor,
  wgssMajor,
  arabMajor,
  chinMajor,
  englMajorCreativeWriting,
  englMajorLanguageWritingRhetoric,
  englMajorLiteraryCulturalStudies,
  englMajorMediaStudies,
  imdmMajorComputing,
  imdmMajorEmergingCreatives,
  lingMajorGrammarsCognition,
  lingMajorLanguage,
  romlMajorFrenchItalian,
  romlMajorFrenchSpanish,
  romlMajorItalianSpanish,
  spanMajorLanguageCultureProfessionalContexts,
  spanMajorLinguisticsCultureEducation,
  spanMajorLiteratureCultureMedia,
];

describe("program GPA rules (ARHU part B)", () => {
  it("encodes the stated graduation GPA per program", () => {
    expect(partB.map((p) => [p.id, p.minGpa]).sort()).toEqual(
      [
        ["hebr-minor", 2.0],
        ["hist-major", 2.0],
        ["isrl-minor", 2.0],
        ["ital-major", 2.0],
        ["ital-minor", 2.0],
        ["japn-major", 2.0],
        ["japn-minor", 2.0],
        ["kore-minor-studies", 2.0],
        ["ling-minor", 2.0],
        ["mest-minor", 2.0],
        ["musc-minor-culture", 2.0],
        ["musc-minor-performance", 2.0],
        ["pers-minor", 2.0],
        ["port-minor", 2.0],
        ["ppe-major", 2.0],
        ["russ-major", 2.0],
        ["russ-minor", 2.0],
        ["thet-major", 2.0],
        ["wgss-major", 2.0],
        ["arab-major", 2.0],
        ["chin-major", 2.0],
        ["engl-major-creative-writing", 2.0],
        ["engl-major-language-writing-rhetoric", 2.0],
        ["engl-major-literary-cultural-studies", 2.0],
        ["engl-major-media-studies", 2.0],
        ["imdm-major-computing", 2.0],
        ["imdm-major-emerging-creatives", 2.0],
        ["ling-major-grammars-cognition", 2.0],
        ["ling-major-language", 2.0],
        ["roml-major-french-italian", 2.0],
        ["roml-major-french-spanish", 2.0],
        ["roml-major-italian-spanish", 2.0],
        ["span-major-language-culture-professional-contexts", 2.0],
        ["span-major-linguistics-culture-education", 2.0],
        ["span-major-literature-culture-media", 2.0],
      ].sort(),
    );
  });
});

const bsosPrograms = [
  aaasMajorPublicPolicy, econMajorBa, econMajorBs, geogMajorCeos, geogMajorGds, geogMajorGeneral, gtstMinor, gvptMinorIdcm, hespMinor, neurMinor, psycMajorBa, socyMajor, survMinor,
];

describe("program GPA rules (BSOS)", () => {
  it("encodes the stated graduation GPA per program", () => {
    expect(bsosPrograms.map((p) => [p.id, p.minGpa]).sort()).toEqual(
      [
        ["aaas-major-public-policy", 2.0],
        ["econ-major-ba", 2.0],
        ["econ-major-bs", 2.0],
        ["geog-major-ceos", 2.0],
        ["geog-major-gds", 2.0],
        ["geog-major-general", 2.0],
        ["gtst-minor", 2.0],
        ["gvpt-minor-idcm", 2.0],
        ["hesp-minor", 2.0],
        ["neur-minor", 2.0],
        ["psyc-major-ba", 1.7],
        ["socy-major", 2.0],
        ["surv-minor", 2.0],
      ].sort(),
    );
  });
});

const cmnsPrograms = [
  bsciMajorCebg, bsciMajorEcev, bsciMajorGenb, bsciMajorMicb, bsciMajorPhnb, chemMajorBa, chemMajorBs,
  geolMinorGeophysics, geolMinorHydrology, geolMinorSurficialGeology, paleobiologyMinor, planetarySciencesMinor,
  mathMajorTraditional, mathMajorApplied, mathMinor, mathMinorActuarial, statisticsMinor, rasMinor,
];

describe("program GPA rules (CMNS)", () => {
  it("encodes the stated graduation GPA per program", () => {
    expect(cmnsPrograms.map((p) => [p.id, p.minGpa]).sort()).toEqual(
      [
        ["bsci-major-cebg", 2.0],
        ["bsci-major-ecev", 2.0],
        ["bsci-major-genb", 2.0],
        ["bsci-major-micb", 2.0],
        ["bsci-major-phnb", 2.0],
        ["chem-major-ba", 2.0],
        ["chem-major-bs", 2.0],
        ["geol-minor-geophysics", 2.0],
        ["geol-minor-hydrology", 2.0],
        ["geol-minor-surficial-geology", 2.0],
        ["paleobiology-minor", 2.0],
        ["planetary-sciences-minor", 2.0],
        ["math-major-traditional", 2.0],
        ["math-major-applied", 2.0],
        ["math-minor", 2.0],
        ["math-minor-actuarial", 2.0],
        ["stat-minor", 2.0],
        ["ras-minor", 2.0],
      ].sort(),
    );
  });
});

const engrPrograms = [aeroMajorAeronautical, aeroMajorAstronautical, biocompMajor, engrMinorQuantum];

describe("program GPA rules (ENGR)", () => {
  it("encodes the stated graduation GPA per program", () => {
    expect(engrPrograms.map((p) => [p.id, p.minGpa]).sort()).toEqual(
      [
        ["aero-major-aeronautical", 2.0],
        ["aero-major-astronautical", 2.0],
        ["biocomp-major", 2.0],
        ["engr-minor-quantum-science-engineering", 2.0],
      ].sort(),
    );
  });
});

const otherPrograms = [
  agnrCert, arecGlobalPovertyMinor, enspSustainabilityStudiesMinor, larcMajor, archConstructionProjectManagementMinor, archRealEstateDevelopmentMinor, plcyMinorPublicLeadership, plcyMinorNonprofitLeadership, anscMajorAnimalCareManagement, anscMajorScienceProfessional, arecMajorAgResourceEcon, arecMajorAgribusiness, arecMajorEnvironmentalResourceEcon, enstMajorAppliedEcologyNaturalResources, enstMajorEcologicalTechnologyDesign, enstMajorEcosystemHealth, enstMajorSoilWatershedScience, acctMajor, finMajor, infsMajor, intbMajor, mgmtMajor, mktgMajor, ombaMajor, scmMajor,
];

describe("program GPA rules (other colleges)", () => {
  it("encodes the stated graduation GPA per program", () => {
    expect(otherPrograms.map((p) => [p.id, p.minGpa]).sort()).toEqual(
      [
        ["agnr-cert", 2.0],
        ["arec-global-poverty-minor", 2.0],
        ["ensp-sustainability-studies-minor", 2.0],
        ["larc-major", 2.0],
        ["arch-construction-project-management-minor", 2.0],
        ["arch-real-estate-development-minor", 2.0],
        ["plcy-minor-public-leadership", 2.0],
        ["plcy-minor-nonprofit-leadership", 2.0],
        ["ansc-major-animal-care-management", 2.0],
        ["ansc-major-science-professional", 2.0],
        ["arec-major-ag-resource-econ", 2.0],
        ["arec-major-agribusiness", 2.0],
        ["arec-major-environmental-resource-econ", 2.0],
        ["enst-major-applied-ecology-natural-resources", 2.0],
        ["enst-major-ecological-technology-design", 2.0],
        ["enst-major-ecosystem-health", 2.0],
        ["enst-major-soil-watershed-science", 2.0],
        ["acct-major", 2.0],
        ["fin-major", 2.0],
        ["infs-major", 2.0],
        ["intb-major", 2.0],
        ["mgmt-major", 2.0],
        ["mktg-major", 2.0],
        ["omba-major", 2.0],
        ["scm-major", 2.0],
      ].sort(),
    );
  });
});

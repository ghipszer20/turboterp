// Environmental Science and Policy Major, Environmental Politics and Policy Concentration (BSOS), 2026-27 UMD Academic Catalog.
// Source: program-sources/environmental-science-policy-major.md (catalog + official four-year plan).
// Shared ENSP Core and common review notes: ensp-shared-2026-27.ts. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { enspCatalogUrl, enspCommonReviewNotes, enspCore, enspPickerInfo } from "./ensp-shared-2026-27.ts";

export const enspMajorEnvironmentalPoliticsPolicy: Program = {
  id: "ensp-major-environmental-politics-policy",
  name: "Environmental Science and Policy Major (Environmental Politics and Policy Concentration)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Environmental Science and Policy Major, " +
    enspCatalogUrl +
    " (fetched 2026-09-28); the official four-year plan (agnr.umd.edu ENSP FourYrPlan PDF for this concentration) is the department source",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    ...enspCommonReviewNotes,
    "Official four-year plan (agnr.umd.edu PDF) transcribed; placeholders filled with real catalog courses (each fill is in the sample plan's notes). The plan's Restricted Elective, Techniques & Methods and similar unnamed slots are left out of the sample plan because they are not encoded.",
    "Open slot 'restricted-electives-pol' (openSlot requirement): restricted electives, 18 credits; the catalog only says 'See ENSP website for list of approved electives' (no list available to us), so the student confirms it with their advisor.",
    "ENSP330 is required directly and is also a Core Applied Science and Policy option (footnote 3 forbids double-counting it); the plan fills a Restricted Elective with ENSP340 for the Core.",
    "'GVPT course of choice, 200/300/400-level with advisor approval' is encoded as any GVPT course numbered 200-499 (advisor approval not encodable), different from the GVPT courses required by name.",
  ],
  requirements: [
    ...enspCore,
    { kind: "course", id: "econ201-pol", name: "Principles of Macroeconomics (ECON201)", options: ["ECON201"] },
    { kind: "course", id: "gvpt170-pol", name: "American Government (GVPT170)", options: ["GVPT170"] },
    { kind: "course", id: "gvpt200-pol", name: "International Political Relations (GVPT200)", options: ["GVPT200"] },
    { kind: "course", id: "gvpt280-pol", name: "The Study of Comparative Politics (GVPT280)", options: ["GVPT280"] },
    { kind: "course", id: "gvpt306-pol", name: "Global Environmental Politics (GVPT306)", options: ["GVPT306"] },
    { kind: "course", id: "gvpt417-pol", name: "Seminar in Advanced Topics in Environmental Policy Analysis (GVPT417)", options: ["GVPT417"] },
    { kind: "course", id: "ensp330-pol", name: "Introduction to Environmental Law (ENSP330)", options: ["ENSP330"] },
    { kind: "choose", id: "gvpt-choice-pol", name: "GVPT course of choice (200-400 level)", count: 1, from: { departments: ["GVPT"], minNumber: 200, maxNumber: 499 } },
    { kind: "openSlot", id: "restricted-electives-pol", name: "Restricted electives", credits: 18, note: "6 courses from the approved list on the ENSP website." },
  ],
};

export const enspMajorEnvironmentalPoliticsPolicyMeta: ProgramMeta = enspPickerInfo("BSOS", "Environmental Politics and Policy");

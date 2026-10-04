// CPA licensure in Maryland. Source: Maryland State Board of Public Accountancy education
// requirements page, as reported by a fetch summary in docs/project/new-tracks-research.md
// section 4 (S). The page was not re-read in full. UNVERIFIED until the owner signs off.

import type { Track } from "../src/types.ts";
import { cat, creditsFrom, oneOf } from "./common.ts";

const BOARD = "https://labor.maryland.gov/license/cpa/cpaexam/cpaexameducreq.shtml";

const ACCOUNTING = ["BMGT220", "BMGT221", "BMGT310", "BMGT311", "BMGT321", "BMGT323", "BMGT326", "BMGT422", "BMGT411", "BMGT417"];

export const cpaMaryland: Track = {
  id: "cpa-maryland",
  name: "CPA licensure (Maryland)",
  schools: "the Maryland State Board of Public Accountancy",
  entry: { kind: "after-degree" },
  categories: [
    creditsFrom(
      "accounting-credits",
      "Accounting (30 credits)",
      30,
      ACCOUNTING,
      "Minimum 30 semester hours in accounting, with coursework in auditing, accounting information systems, federal income tax, ethics, financial accounting and electives (Maryland Board)",
    ),
    // Counts alongside the accounting pool without using its courses up.
    cat(
      { kind: "choose", id: "ethics", name: "Accounting ethics (3 credits)", credits: 3, from: { courses: ["BMGT411"] }, overlay: true },
      "3 semester hours of ethics, part of the 30 accounting and ethics hours to sit for the exam (Maryland Board)",
    ),
    cat(
      { kind: "choose", id: "business-credits", name: "Business subjects (18 credits)", credits: 18, from: { departments: ["BMGT", "ECON", "STAT"], exclude: [...ACCOUNTING, "BMGT380"] } },
      "At least 18 semester hours of business coursework across five of nine subject areas: statistics, economics, finance, management, marketing, data analytics, communication, IT/systems, quantitative methods (Maryland Board)",
    ),
    cat(oneOf("business-law", "Business law (3 credits)", ["BMGT380"]), "3 semester hours of business law (Maryland Board)"),
    // Every course counts toward the licensure total, without using courses up.
    cat(
      { kind: "choose", id: "total-credits", name: "150 semester credit hours for licensure", credits: 150, from: { anyCourse: true }, overlay: true },
      "150 semester credit hours (225 quarter hours) of education for licensure (Maryland Board)",
    ),
  ],
  milestones: [
    {
      id: "one-twenty-credits",
      kind: "advising",
      name: "120 semester hours to sit for the exam",
      detail:
        "You can sit for the Uniform CPA Exam with 120 semester hours that include 30 hours of accounting and ethics (27 accounting plus 3 ethics). Licensure needs 150 hours (tracked as a category).",
    },
    {
      id: "cpa-exam",
      kind: "exam",
      name: "Uniform CPA Exam",
      detail: "The Uniform CPA Exam comes after the education requirement. The Board sets no GPA.",
    },
  ],
  disclaimer: "Confirm with the Maryland Board of Public Accountancy and each target school.",
  sources: [BOARD],
  verified: false,
  reviewNotes: [
    "(S) Every figure (120 hours to sit, 30 accounting and ethics, 150 for licensure, 18 business hours, 3 hours of business law) comes from a fetch summary that is not verbatim; the research doc says to re-read the Board page for the exact grouping wording before verifying. Prior standards stay usable until June 30, 2026; only current standards are encoded.",
    "The 150-hour total is an overlay category (any course, credits counted without using courses up); the 120-hour figure is a milestone only.",
    "Business subjects are checked as 18 credits from any BMGT, ECON or STAT course other than the accounting list and BMGT380 (the research doc lists only STAT100/STAT400, ECON200/ECON201 and BMGT340, which total 15 credits). The \"five of nine subject areas\" rule is not audited, so the student confirms it.",
    "Business law is BMGT380 (Business Law I), per the research doc. Ethics is BMGT411 (Ethics and Professionalism in Accounting), and also counts toward the 30 accounting credits.",
    "BMGT221, BMGT310, BMGT311, BMGT321, BMGT323, BMGT326, BMGT411, BMGT417 and BMGT422 are not in the Spring 2027 schedule fixture; they were added from the research doc's fetched titles alone (credits assumed 3).",
    "No science GPA: this is a business-school credential. No minimum grade (the Board summary sets none).",
  ],
};

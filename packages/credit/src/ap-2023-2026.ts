// UMD credit for AP exams taken May 2023 – May 2026, transcribed by hand from the Registrar's
// "Advanced Placement Exams (AP) for General Education (Effective for May 2023-2026 exams)" PDF.
// test/fixtures/ap-chart-may2023-may2026.txt is that PDF's text (pdftotext -raw) for checking.
// The chart gives one credit total per row; where a row names several courses, the split
// between them comes from the IB chart or UMD's catalog (SOURCES.md lists each one).

import { course, elective, labLecture, genEdOnly, oneOf, row } from "./chart.ts";
import type { ApExam } from "./types.ts";

const LANGUAGE_NOTE =
  "World language: take UMD's World Language Placement Assessment and contact the School of Languages, Literatures and Cultures about placement.";
const CALC_NOTE = "Credit is granted for Calculus AB or BC, not both.";

export const AP_CHART = {
  title: "Advanced Placement Exams (AP) for General Education (Effective for May 2023-2026 exams)",
  url: "https://registrar.umd.edu/sites/default/files/2023-03/ap-gen-ed.pdf",
  exams: "May 2023 – May 2026",
} as const;

export const AP_EXAMS: ApExam[] = [
  {
    name: "African American Studies",
    aliases: ["African American Studies (10)"],
    rows: [
      row([3], 3, "Lower Level Elective", elective(3)),
      row([4, 5], 3, "AASP 100 (DSHS and DVUP)", course("AASP100", 3, "DSHS", "DVUP")),
    ],
  },
  {
    name: "Art History",
    aliases: [],
    rows: [
      row([3], 3, "Lower Level Elective", elective(3)),
      row([4, 5], 3, "ARTH 200 (DSHU and DVUP) or ARTH 201 (DSHU and DVUP)", oneOf(3, ["ARTH200", ["DSHU", "DVUP"]], ["ARTH201", ["DSHU", "DVUP"]])),
    ],
  },
  {
    name: "Drawing",
    aliases: ["Art Studio-Drawing", "Studio Art: Drawing"],
    rows: [
      row([3], 3, "Lower Level Elective", elective(3)),
      row([4, 5], 3, "ARTT 110 (DSSP)", course("ARTT110", 3, "DSSP")),
    ],
  },
  {
    name: "2-D Art and Design",
    aliases: ["Art Studio-2D Design", "2D Art and Design"],
    rows: [
      row([3], 3, "Lower Level Elective", elective(3)),
      row([4, 5], 3, "ARTT 100 (DSSP)", course("ARTT100", 3, "DSSP")),
    ],
  },
  {
    name: "3-D Art and Design",
    aliases: ["Art Studio-3D Design", "3D Art and Design"],
    rows: [
      row([3], 3, "Lower Level Elective", elective(3)),
      row([4, 5], 3, "Lower Level Elective, with option for portfolio review", elective(3)),
    ],
  },
  {
    name: "Biology",
    aliases: [],
    rows: [
      row([3], 4, "Lab Science (DSNL)", genEdOnly("Lab Science", 4, "DSNL")),
      row(
        [4, 5],
        8,
        "BSCI 160, BSCI 161 (DSNL), and BSCI 170, BSCI 171 (DSNL)",
        labLecture("BSCI160", 3, "BSCI161", "DSNL"),
        course("BSCI161", 1),
        labLecture("BSCI170", 3, "BSCI171", "DSNL"),
        course("BSCI171", 1),
      ),
    ],
  },
  {
    name: "Chemistry",
    aliases: [],
    rows: [
      row([3], 3, "Lower Level Elective", elective(3)),
      row([4], 4, "CHEM 131 and CHEM 132 (DSNL)", labLecture("CHEM131", 3, "CHEM132", "DSNL"), course("CHEM132", 1)),
      row([5], 6, "CHEM 131 and CHEM 132 (DSNL); CHEM 271", labLecture("CHEM131", 3, "CHEM132", "DSNL"), course("CHEM132", 1), course("CHEM271", 2)),
    ],
  },
  {
    name: "Chinese Language and Culture",
    aliases: ["Chinese Language & Culture"],
    rows: [row([3, 4, 5], 3, "Lower Level Elective", elective(3))],
    notes: [LANGUAGE_NOTE],
  },
  {
    name: "Computer Science A",
    aliases: [],
    rows: [
      row([3], 2, "Lower Level Elective", elective(2)),
      row([4], 3, "Lower Level Elective", elective(3)),
      row([5], 4, "CMSC 131", course("CMSC131", 4)),
    ],
  },
  {
    name: "Computer Science Principles",
    aliases: [],
    rows: [row([3, 4, 5], 3, "Lower Level Elective [INST majors - consult advisor for applicability]", elective(3))],
  },
  {
    name: "Cybersecurity",
    aliases: [],
    rows: [row([3], 2, "Lower Level Elective", elective(2)), row([4, 5], 3, "Lower Level Elective", elective(3))],
  },
  {
    name: "Macroeconomics",
    aliases: ["Economics- Macro", "Economics Macro"],
    rows: [
      row([3], 3, "History/Social Science (DSHS)", genEdOnly("History/Social Science", 3, "DSHS")),
      row([4, 5], 3, "ECON 201 (DSHS)", course("ECON201", 3, "DSHS")),
    ],
  },
  {
    name: "Microeconomics",
    aliases: ["Economics- Micro", "Economics Micro"],
    rows: [
      row([3], 3, "History/Social Science (DSHS)", genEdOnly("History/Social Science", 3, "DSHS")),
      row([4, 5], 3, "ECON 200 (DSHS)", course("ECON200", 3, "DSHS")),
    ],
  },
  {
    name: "English Language and Composition",
    aliases: [],
    rows: [
      row([3], 3, "Lower Level Elective", elective(3)),
      row([4, 5], 3, "Academic Writing (FSAW)", genEdOnly("Academic Writing", 3, "FSAW")),
    ],
  },
  {
    name: "English Literature and Composition",
    aliases: [],
    rows: [
      row([3], 3, "Lower Level Elective", elective(3)),
      row([4, 5], 6, "ENGL 278 and Lower Level Elective", course("ENGL278", 3), elective(3)),
    ],
  },
  {
    name: "Environmental Science",
    aliases: [],
    rows: [
      row([3], 3, "Lower Level Elective", elective(3)),
      row([4, 5], 3, "Non-Lab Science (DSNS)", genEdOnly("Non-Lab Science", 3, "DSNS")),
    ],
  },
  {
    name: "French Language and Culture",
    aliases: [],
    rows: [
      row([3], 4, "Lower Level Elective [consult French department for placement]", elective(4)),
      row([4], 4, "FREN 203", course("FREN203", 4)),
      row([5], 6, "FREN 204 and Lower Level Elective", course("FREN204", 3), elective(3)),
    ],
    notes: [LANGUAGE_NOTE],
  },
  {
    name: "Human Geography",
    aliases: ["Geography-Human"],
    rows: [
      row([3], 3, "History/Social Science (DSHS)", genEdOnly("History/Social Science", 3, "DSHS")),
      row([4, 5], 3, "GEOG 202 (DSHS and DVCC)", course("GEOG202", 3, "DSHS", "DVCC")),
    ],
  },
  {
    name: "German Language and Culture",
    aliases: [],
    rows: [
      row([3], 3, "Lower Level Elective", elective(3)),
      row([4], 4, "GERS 203", course("GERS203", 4)),
      row([5], 7, "GERS 203 and GERS 204", course("GERS203", 4), course("GERS204", 3)),
    ],
    notes: [LANGUAGE_NOTE],
  },
  {
    name: "United States Government and Politics",
    aliases: ["Government and Politics - US", "US Government and Politics"],
    rows: [
      row([3], 3, "History/Social Science (DSHS)", genEdOnly("History/Social Science", 3, "DSHS")),
      row([4, 5], 3, "GVPT 170 (DSHS)", course("GVPT170", 3, "DSHS")),
    ],
  },
  {
    name: "Comparative Government and Politics",
    aliases: ["Government and Politics- Comparative"],
    rows: [row([3], 3, "Lower Level Elective", elective(3)), row([4, 5], 3, "GVPT 280", course("GVPT280", 3))],
  },
  {
    name: "United States History",
    aliases: ["History- United States", "US History"],
    rows: [
      row([3], 3, "Lower Level Elective", elective(3)),
      row(
        [4],
        3,
        "HIST 200 (DSHS or DSHU) or HIST 201 (DSHS or DSHU and DVUP)",
        oneOf(3, ["HIST200", ["DSHS", "DSHU"]], ["HIST201", ["DSHS", "DSHU", "DVUP"]]),
      ),
      row(
        [5],
        6,
        "HIST 200 (DSHS or DSHU) and HIST 201 (DSHS or DSHU and DVUP)",
        course("HIST200", 3, "DSHS", "DSHU"),
        course("HIST201", 3, "DSHS", "DSHU", "DVUP"),
      ),
    ],
  },
  {
    name: "European History",
    aliases: ["History- European"],
    rows: [
      row([3], 3, "Lower Level Elective", elective(3)),
      row([4], 3, "HIST 113 (DSHS)", course("HIST113", 3, "DSHS")),
      row([5], 6, "HIST 112 and HIST 113 (DSHS)", course("HIST112", 3), course("HIST113", 3, "DSHS")),
    ],
  },
  {
    name: "World History: Modern",
    aliases: ["History- World", "World History"],
    rows: [row([3, 4, 5], 3, "Lower Level Elective", elective(3))],
  },
  {
    name: "Italian Language and Culture",
    aliases: [],
    rows: [
      row([3], 4, "ITAL 103- [student placement into ITAL 203]", course("ITAL103", 4)),
      row([4], 4, "ITAL 203- [student placement into ITAL 204]", course("ITAL203", 4)),
      row([5], 3, "ITAL 204- [student placement into ITAL 207]", course("ITAL204", 3)),
    ],
    notes: [LANGUAGE_NOTE],
  },
  {
    name: "Japanese Language and Culture",
    aliases: [],
    rows: [row([3, 4, 5], 3, "Lower Level Elective", elective(3))],
    notes: [LANGUAGE_NOTE],
  },
  {
    name: "Latin",
    aliases: [],
    rows: [
      row([3], 3, "Lower Level Elective [consult Classics advisor for placement]", elective(3)),
      row([4, 5], 4, "LATN 201", course("LATN201", 4)),
    ],
    notes: [LANGUAGE_NOTE],
  },
  {
    name: "Precalculus",
    aliases: ["Math-Precalculus"],
    rows: [row([3], 3, "Lower Level Elective", elective(3)), row([4, 5], 3, "MATH 115 (FSMA)", course("MATH115", 3, "FSMA"))],
  },
  {
    name: "Calculus AB",
    aliases: ["Math-Calculus AB"],
    rows: [
      row([3], 3, "Lower Level Elective", elective(3)),
      row([4, 5], 4, "MATH 140 (FSMA and FSAR)", course("MATH140", 4, "FSMA", "FSAR")),
    ],
    notes: [CALC_NOTE],
  },
  {
    name: "Calculus BC",
    aliases: ["Math-Calculus BC"],
    rows: [
      row([3], 3, "Lower Level Elective", elective(3)),
      row([4, 5], 8, "MATH 140 (FSMA and FSAR) and MATH 141", course("MATH140", 4, "FSMA", "FSAR"), course("MATH141", 4)),
    ],
    notes: [CALC_NOTE],
  },
  {
    name: "Calculus BC AB Subscore",
    aliases: ["Math-Calculus BC w/AB Subscore", "Calculus AB Subscore"],
    rows: [
      row([3], 3, "Lower Level Elective", elective(3)),
      row(
        [4, 5],
        4,
        "MATH 140 (FSMA and FSAR); If Calculus BC score is 3 or below, the subscore is processed as the AB exam; Credit will not be awarded for both the AB subscore and BC exam",
        course("MATH140", 4, "FSMA", "FSAR"),
      ),
    ],
    notes: [
      "If the Calculus BC score is 3 or below, the AB subscore is processed as the AB exam; credit is not awarded for both the AB subscore and the BC exam.",
    ],
  },
  {
    name: "Music Theory",
    aliases: [],
    rows: [row([3, 4, 5], 3, "MUSC 140 (DSSP)", course("MUSC140", 3, "DSSP"))],
  },
  {
    name: "Networking",
    aliases: [],
    rows: [row([3], 2, "Lower Level Elective", elective(2)), row([4, 5], 3, "Lower Level Elective", elective(3))],
  },
  {
    name: "Physics C: Mechanics",
    aliases: ["Physics C-Mechanics"],
    rows: [
      row([3], 4, "Lab Science (DSNL)", genEdOnly("Lab Science", 4, "DSNL")),
      row(
        [4, 5],
        4,
        "PHYS 161 and PHYS 261 (DSNL) [PHYS majors-consult advisor for more information]",
        labLecture("PHYS161", 3, "PHYS261", "DSNL"),
        course("PHYS261", 1),
      ),
    ],
  },
  {
    name: "Physics C: Electricity and Magnetism",
    aliases: ["Physics C-Electricity and Magnetism"],
    rows: [
      row([3], 4, "Lab Science (DSNL)", genEdOnly("Lab Science", 4, "DSNL")),
      row(
        [4, 5],
        4,
        "PHYS 260 and PHYS 271 (DSNL) [PHYS majors-consult advisor for more information]",
        labLecture("PHYS260", 3, "PHYS271", "DSNL"),
        course("PHYS271", 1),
      ),
    ],
  },
  {
    name: "Physics 1: Algebra-Based",
    aliases: ["Physics 1"],
    rows: [
      row([3], 4, "Lab Science (DSNL)", genEdOnly("Lab Science", 4, "DSNL")),
      row([4, 5], 4, "PHYS 121 (DSNL)", course("PHYS121", 4, "DSNL")),
    ],
  },
  {
    name: "Physics 2: Algebra-Based",
    aliases: ["Physics 2"],
    rows: [
      row([3], 4, "Lab Science (DSNL)", genEdOnly("Lab Science", 4, "DSNL")),
      row([4, 5], 4, "PHYS 122 (DSNL)", course("PHYS122", 4, "DSNL")),
    ],
  },
  {
    name: "Psychology",
    aliases: [],
    rows: [row([3], 3, "Lower Level Elective", elective(3)), row([4, 5], 3, "PSYC 100 (DSHS or DSNS)", course("PSYC100", 3, "DSHS", "DSNS"))],
  },
  {
    name: "Spanish Language and Culture",
    aliases: [],
    rows: [
      row([3], 3, "Lower Level Elective [contact Spanish advisor for placement]", elective(3)),
      row([4], 3, "SPAN 204", course("SPAN204", 3)),
      row([5], 6, "SPAN 204 and Lower Level Elective", course("SPAN204", 3), elective(3)),
    ],
    notes: [LANGUAGE_NOTE],
  },
  {
    name: "Spanish Literature and Culture",
    aliases: [],
    rows: [
      row([3, 4], 3, "Lower Level Elective [contact Spanish advisor for placement]", elective(3)),
      row([5], 6, "SPAN 207 (DSHU) and Lower Level Elective", course("SPAN207", 3, "DSHU"), elective(3)),
    ],
    notes: [LANGUAGE_NOTE],
  },
  {
    name: "Statistics",
    aliases: [],
    rows: [row([3], 3, "Lower Level Elective", elective(3)), row([4, 5], 3, "STAT 100 (FSMA and FSAR)", course("STAT100", 3, "FSMA", "FSAR"))],
  },
  { name: "Research", aliases: ["AP Research"], rows: [row([3, 4, 5], 3, "Lower Level Elective", elective(3))] },
  { name: "Seminar", aliases: ["AP Seminar"], rows: [row([3, 4, 5], 3, "Lower Level Elective", elective(3))] },
];

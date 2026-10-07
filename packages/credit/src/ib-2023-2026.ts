// UMD credit for IB exams taken November 2023 – May 2026, transcribed by hand from the rendered
// pages of the Registrar's "International Baccalaureate (IB) Exams for November 2023 – May 2026" PDF.
// The PDF's extracted text separates exam titles from their rows, so the rows were read from the
// page images; test/fixtures/ib-chart-nov2023-may2026.txt is that text, used to check course ids.
// The chart prints per-course credits and Gen Ed, so no splits were inferred here.
// "Standard" is SL and "Higher" is HL. A level with no rows is "Credit is not awarded for the exam".

import { course, elective, labLecture, genEdOnly, oneOf, row } from "./chart.ts";
import type { IbExam } from "./types.ts";

const LANGUAGE_NOTE =
  "World language: take UMD's World Language Placement (WLP) and contact the School of Languages, Literatures and Cultures about placement.";
const NDE = "No Direct Equivalent";

export const IB_CHART = {
  title: "International Baccalaureate (IB) Exams for November 2023 – May 2026",
  url: "https://registrar.umd.edu/sites/default/files/2024-07/ib-gen-ed-may-2024.pdf",
  exams: "November 2023 – May 2026",
} as const;

const l1 = (scores: number[], credits = 3) => row(scores, credits, "L1", elective(credits));
const same = (...rows: ReturnType<typeof row>[]) => ({ SL: rows, HL: rows });

export const IB_EXAMS: IbExam[] = [
  {
    subject: "Anthropology",
    name: "Social and Cultural Anthropology",
    aliases: ["Anthropology"],
    levels: same(row([4, 5, 6, 7], 3, "ANTH260", course("ANTH260", 3, "DSHS", "DVUP"))),
  },
  { subject: "Arabic", name: "Arabic", aliases: [], allExamTypes: true, levels: same(l1([5, 6, 7])), notes: [LANGUAGE_NOTE] },
  {
    subject: "Architecture",
    name: "Design Technology",
    aliases: [],
    levels: { SL: [], HL: [l1([5]), row([6, 7], 3, "ARCH170", course("ARCH170", 3, "DSHU"))] },
  },
  {
    subject: "Art",
    name: "Visual Arts",
    aliases: [],
    levels: { SL: [], HL: [row([5, 6, 7], 6, "ARTT100 and ARTT150", course("ARTT100", 3, "DSSP"), course("ARTT150", 3, "DSHU"))] },
  },
  {
    subject: "Biology",
    name: "Biology",
    aliases: [],
    levels: {
      SL: [],
      HL: [
        row([5], 4, NDE, genEdOnly(NDE, 4, "DSNL")),
        row(
          [6, 7],
          8,
          "BSCI160 and BSCI161 and BSCI170 and BSCI171",
          labLecture("BSCI160", 3, "BSCI161", "DSNL"),
          course("BSCI161", 1),
          labLecture("BSCI170", 3, "BSCI171", "DSNL"),
          course("BSCI171", 1),
        ),
      ],
    },
  },
  {
    subject: "Business",
    name: "Business Management",
    aliases: [],
    levels: same(l1([4]), row([5, 6, 7], 3, "BMGT110", course("BMGT110", 3))),
  },
  {
    subject: "Chemistry",
    name: "Chemistry",
    aliases: [],
    levels: {
      // The chart prints "CHEM131 and CHEM132 and" for SL 6, 7, with no third course.
      SL: [row([5], 4, NDE, genEdOnly(NDE, 4, "DSNL")), row([6, 7], 4, "CHEM131 and CHEM132", labLecture("CHEM131", 3, "CHEM132", "DSNL"), course("CHEM132", 1))],
      HL: [
        row([5], 4, "CHEM131 and CHEM132", labLecture("CHEM131", 3, "CHEM132", "DSNL"), course("CHEM132", 1)),
        row([6, 7], 6, "CHEM131 and CHEM132 and CHEM271", labLecture("CHEM131", 3, "CHEM132", "DSNL"), course("CHEM132", 1), course("CHEM271", 2)),
      ],
    },
  },
  { subject: "Chinese", name: "Chinese", aliases: [], allExamTypes: true, levels: { SL: [], HL: [l1([5, 6, 7])] }, notes: [LANGUAGE_NOTE] },
  { subject: "Computer Science", name: "Computer Science", aliases: [], levels: { SL: [], HL: [l1([5], 2), l1([6, 7])] } },
  { subject: "Dance", name: "Dance", aliases: [], levels: same(l1([4]), row([5, 6, 7], 3, "DANC200", course("DANC200", 3, "DSSP"))) },
  {
    subject: "Economics",
    name: "Economics",
    aliases: [],
    levels: {
      SL: [row([5, 6, 7], 3, NDE, genEdOnly(NDE, 3, "DSHS"))],
      HL: [row([5, 6, 7], 6, "ECON200 and ECON201", course("ECON200", 3, "DSHS"), course("ECON201", 3, "DSHS"))],
    },
  },
  { subject: "English", name: "English A: Literature", aliases: [], levels: same(l1([5, 6, 7])) },
  {
    subject: "English",
    name: "English A: Language & Literature",
    aliases: [],
    levels: { SL: [], HL: [row([5, 6, 7], 3, 'L1 (PF option if an "A" or "B" is earned on Extended Essay)', elective(3))] },
    notes: ['HL: pass/fail option if an "A" or "B" is earned on the Extended Essay.'],
  },
  { subject: "English", name: "English Literature and Performance", aliases: [], levels: { SL: [] } },
  { subject: "English", name: "English B", aliases: [], levels: { SL: [], HL: [] } },
  { subject: "English", name: "English ab initio", aliases: [], levels: { SL: [] } },
  {
    subject: "Environmental Studies",
    name: "Environmental Systems and Societies",
    aliases: [],
    levels: { SL: [l1([5]), row([6, 7], 3, NDE, genEdOnly(NDE, 3, "DSNS"))] },
  },
  { subject: "Film", name: "Film", aliases: [], levels: same(row([5, 6, 7], 3, "CINE280", course("CINE280", 3, "DSHU", "DVUP"))) },
  {
    subject: "French",
    name: "French",
    aliases: [],
    allExamTypes: true,
    levels: {
      SL: [
        row([5], 4, "FREN203 or FREN204", oneOf(4, ["FREN203", []], ["FREN204", []])),
        row([6, 7], 6, "FREN204 and FREN211", course("FREN204", 3), course("FREN211", 3)),
      ],
      HL: [
        row([5], 6, "FREN204 and FREN250", course("FREN204", 3), course("FREN250", 3)),
        row([6, 7], 9, "FREN204 and FREN211 and FREN250", course("FREN204", 3), course("FREN211", 3), course("FREN250", 3)),
      ],
    },
    notes: [LANGUAGE_NOTE],
  },
  { subject: "Geography", name: "Geography", aliases: [], levels: same(row([5, 6, 7], 3, "GEOG100", course("GEOG100", 3, "DSHS"))) },
  {
    subject: "German",
    name: "German",
    aliases: [],
    allExamTypes: true,
    levels: {
      SL: [row([5, 6, 7], 4, "GERS203", course("GERS203", 4))],
      HL: [row([5], 4, "GERS203", course("GERS203", 4)), row([6, 7], 7, "GERS203 and GERS204", course("GERS203", 4), course("GERS204", 3))],
    },
    notes: [LANGUAGE_NOTE],
  },
  { subject: "Government", name: "Global Politics", aliases: [], levels: { SL: [], HL: [l1([5, 6, 7])] } },
  {
    subject: "Greek",
    name: "Greek (Modern) A: Language & Literature",
    aliases: ["Modern Greek A: Language & Literature"],
    levels: same(l1([5, 6, 7])),
    notes: [LANGUAGE_NOTE],
  },
  { subject: "Greek", name: "Classical Languages (Greek)", aliases: ["Classical Greek"], levels: same(l1([5, 6, 7])), notes: [LANGUAGE_NOTE] },
  { subject: "Hebrew", name: "Hebrew", aliases: [], allExamTypes: true, levels: { SL: [l1([5, 6, 7])] }, notes: [LANGUAGE_NOTE] },
  { subject: "Hindi", name: "Hindi", aliases: [], allExamTypes: true, levels: same(l1([5, 6, 7])) },
  { subject: "History", name: "History", aliases: [], levels: { SL: [], HL: [row([5, 6, 7], 3, NDE, genEdOnly(NDE, 3, "DSHS"))] } },
  {
    subject: "History",
    name: "History: Africa",
    aliases: [],
    levels: {
      HL: [
        row([5], 3, "HIST122 or HIST123", oneOf(3, ["HIST122", ["DSHS", "DVUP"]], ["HIST123", ["DSHS", "DVUP"]])),
        row([6, 7], 6, "HIST122 and HIST123", course("HIST122", 3, "DSHS", "DVUP"), course("HIST123", 3, "DSHS", "DVUP")),
      ],
    },
  },
  {
    subject: "History",
    name: "History: Americas",
    aliases: [],
    levels: {
      HL: [
        row([5], 3, "HIST200 or HIST201", oneOf(3, ["HIST200", ["DSHS", "DSHU"]], ["HIST201", ["DSHS", "DSHU", "DVUP"]])),
        row([6, 7], 6, "HIST200 and HIST201", course("HIST200", 3, "DSHS", "DSHU"), course("HIST201", 3, "DSHS", "DSHU", "DVUP")),
      ],
    },
  },
  {
    subject: "History",
    name: "History: Europe",
    aliases: [],
    levels: {
      HL: [
        row([5], 3, "HIST112 or HIST113", oneOf(3, ["HIST112", []], ["HIST113", ["DSHS"]])),
        row([6, 7], 6, "HIST112 and HIST113", course("HIST112", 3), course("HIST113", 3, "DSHS")),
      ],
    },
  },
  {
    subject: "History",
    name: "History: Asia & Oceania",
    aliases: [],
    levels: { HL: [row([5, 6, 7], 3, NDE, genEdOnly(NDE, 3, "DSHS"))] },
  },
  {
    subject: "Information Technology",
    name: "Information Technology in a Global Society",
    aliases: ["ITGS"],
    levels: { SL: [], HL: [l1([5, 6, 7])] },
  },
  {
    subject: "Italian",
    name: "Italian",
    aliases: [],
    allExamTypes: true,
    levels: {
      SL: [row([5], 4, "ITAL203", course("ITAL203", 4)), row([6, 7], 6, "ITAL204 and ITAL211", course("ITAL204", 3), course("ITAL211", 3))],
      HL: [
        row([5], 6, "ITAL204 and ITAL251", course("ITAL204", 3), course("ITAL251", 3)),
        row([6, 7], 9, "ITAL204 and ITAL211 and ITAL251", course("ITAL204", 3), course("ITAL211", 3), course("ITAL251", 3)),
      ],
    },
    notes: [LANGUAGE_NOTE],
  },
  { subject: "Japanese", name: "Japanese", aliases: [], allExamTypes: true, levels: { SL: [], HL: [l1([5, 6, 7])] }, notes: [LANGUAGE_NOTE] },
  { subject: "Kinesiology", name: "Sports, Exercise and Health Science", aliases: [], levels: same(l1([5, 6, 7])) },
  { subject: "Korean", name: "Korean", aliases: [], allExamTypes: true, levels: { SL: [], HL: [l1([5, 6, 7])] }, notes: [LANGUAGE_NOTE] },
  {
    subject: "Latin",
    name: "Classical Languages (Latin)",
    aliases: ["Latin"],
    levels: same(row([5, 6, 7], 4, "LATN201", course("LATN201", 4))),
    notes: [LANGUAGE_NOTE],
  },
  {
    subject: "Mathematics",
    name: "Mathematics: Analysis and Approaches",
    aliases: ["Analysis/Approaches", "Math AA"],
    levels: {
      SL: [],
      HL: [row([4], 4, "L1", elective(4)), row([5, 6, 7], 7, "MATH140 and STAT100", course("MATH140", 4, "FSMA", "FSAR"), course("STAT100", 3, "FSMA", "FSAR"))],
    },
  },
  {
    subject: "Mathematics",
    name: "Mathematics: Applications and Interpretation",
    // The chart spells it "Applications/Intepretation".
    aliases: ["Applications/Intepretation", "Applications/Interpretation", "Math AI"],
    levels: {
      SL: [],
      HL: [row([4], 4, "L1", elective(4)), row([5, 6, 7], 7, "MATH140 and STAT100", course("MATH140", 4, "FSMA", "FSAR"), course("STAT100", 3, "FSMA", "FSAR"))],
    },
  },
  { subject: "Music", name: "Music", aliases: [], allExamTypes: true, levels: same(row([5, 6, 7], 3, "MUSC130", course("MUSC130", 3, "DSHU"))) },
  { subject: "Persian", name: "Persian A: Literature", aliases: [], levels: same(l1([5, 6, 7])) },
  { subject: "Philosophy", name: "Philosophy", aliases: [], levels: same(row([5, 6, 7], 3, "PHIL100", course("PHIL100", 3, "DSHU"))) },
  {
    subject: "Physics",
    name: "Physics",
    aliases: [],
    levels: {
      SL: [row([4, 5, 6, 7], 4, NDE, genEdOnly(NDE, 4, "DSNL"))],
      HL: [row([4], 4, NDE, genEdOnly(NDE, 4, "DSNL")), row([5, 6, 7], 8, "PHYS121 and PHYS122", course("PHYS121", 4, "DSNL"), course("PHYS122", 4, "DSNL"))],
    },
  },
  {
    subject: "Portuguese",
    name: "Portuguese",
    aliases: [],
    allExamTypes: true,
    levels: {
      SL: [row([5], 4, "PORT103", course("PORT103", 4)), row([6, 7], 4, "PORT203", course("PORT203", 4))],
      HL: [row([5], 3, "PORT205", course("PORT205", 3)), row([6, 7], 3, "PORT207", course("PORT207", 3))],
    },
    notes: [LANGUAGE_NOTE],
  },
  {
    subject: "Psychology",
    name: "Psychology",
    aliases: [],
    levels: same(row([5], 3, NDE, genEdOnly(NDE, 3, "DSHS")), row([6, 7], 3, "PSYC100", course("PSYC100", 3, "DSNS", "DSHS"))),
  },
  {
    subject: "Religion",
    name: "World Religions",
    aliases: [],
    levels: { SL: [l1([5]), row([6, 7], 3, NDE, genEdOnly(NDE, 3, "DSHU"))] },
  },
  { subject: "Russian", name: "Russian", aliases: [], allExamTypes: true, levels: same(l1([5, 6, 7])), notes: [LANGUAGE_NOTE] },
  {
    subject: "Spanish",
    name: "Spanish",
    aliases: [],
    allExamTypes: true,
    levels: {
      SL: [row([5], 4, "SPAN203", course("SPAN203", 4)), row([6, 7], 6, "SPAN204 and SPAN207", course("SPAN204", 3), course("SPAN207", 3, "DSHU"))],
      HL: [
        row([5], 6, "SPAN204 and SPAN207", course("SPAN204", 3), course("SPAN207", 3, "DSHU")),
        row([6, 7], 9, "SPAN204 and SPAN207 and SPAN221", course("SPAN204", 3), course("SPAN207", 3, "DSHU"), course("SPAN221", 3)),
      ],
    },
    notes: [LANGUAGE_NOTE],
  },
  // The chart awards 6 credits for Swahili HL and 3 for SL.
  { subject: "Swahili", name: "Swahili", aliases: [], allExamTypes: true, levels: { SL: [l1([5, 6, 7])], HL: [l1([5, 6, 7], 6)] } },
  { subject: "Thai", name: "Thai", aliases: [], allExamTypes: true, levels: same(l1([5, 6, 7])) },
  { subject: "Theatre", name: "Theatre", aliases: [], levels: same(l1([4]), row([5, 6, 7], 3, "THET110", course("THET110", 3, "DSHU"))) },
];

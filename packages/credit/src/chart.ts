// Builders that keep the transcribed chart rows short and close to the printed text.

import type { AwardPart, ChartRow } from "./types.ts";

export const course = (id: string, credits: number, ...genEd: string[]): AwardPart => ({ kind: "course", id, credits, genEd });

/** A lab-science lecture whose lab is awarded in the same row ("CHEM 131 and CHEM 132 (DSNL)"): the pair counts as one lab course. */
export const labLecture = (id: string, credits: number, lab: string, ...genEd: string[]): AwardPart => ({ kind: "course", id, credits, genEd, lab });

/** UMD's "Lower Level Elective" (L1): counts toward total credits only. */
export const elective = (credits: number): AwardPart => ({ kind: "generic", label: "Lower Level Elective", credits, genEd: [] });

/** Gen Ed credit with no UMD course, e.g. "Lab Science (DSNL)" or IB's "No Direct Equivalent". */
export const genEdOnly = (label: string, credits: number, ...genEd: string[]): AwardPart => ({ kind: "generic", label, credits, genEd });

export const oneOf = (credits: number, ...options: [id: string, genEd: string[]][]): AwardPart => ({
  kind: "choice",
  credits,
  options: options.map(([id, genEd]) => ({ id, genEd })),
});

export const row = (scores: number[], credits: number, text: string, ...parts: AwardPart[]): ChartRow => ({ scores, credits, text, parts });

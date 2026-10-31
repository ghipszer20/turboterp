// Matches a transcript's abbreviated AP exam name (Testudo prints things like "HUMAN GEOG",
// "CALC BC/AB SUB", "PHYSICS C-ELM") to one of @turboterp/credit's official exam names
// (apExamNames()), so the imported AP line can become an ApInput UMD's credit chart actually knows
// how to look up. Unmatched names are surfaced to the student rather than guessed at or dropped.

// A handful of Testudo abbreviations that don't reduce to a token prefix of the official name (the
// official chart itself resorts to an alias for one of these -- "US History" -- for the same
// reason). Applied to the transcript side only, before tokenizing.
const ABBREVIATIONS: [RegExp, string][] = [
  [/\bU\.?S\.?\b/gi, "UNITED STATES"],
  [/\bELM\b/gi, "ELECTRICITY AND MAGNETISM"],
  [/\bMECH\b/gi, "MECHANICS"],
];

function preprocess(s: string): string {
  return ABBREVIATIONS.reduce((out, [re, rep]) => out.replace(re, rep), s);
}

function normalizeTokens(s: string): string[] {
  return s
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/** A transcript token "matches" a candidate token if it's the same word or a prefix of a longer
 * one ("GEOG" -> "GEOGRAPHY"); a single-letter transcript token must match exactly, so a lone
 * initial can't spuriously prefix-match half the alphabet. */
function tokenClaims(examToken: string, candidateToken: string): boolean {
  return examToken.length === 1 ? candidateToken === examToken : candidateToken.startsWith(examToken);
}

function allTokensMatch(examTokens: string[], candidateTokens: string[]): boolean {
  const pool = [...candidateTokens];
  for (const t of examTokens) {
    const idx = pool.findIndex((c) => tokenClaims(t, c));
    if (idx === -1) return false;
    pool.splice(idx, 1);
  }
  return true;
}

/** Finds the official exam name a transcript's (possibly abbreviated) exam name means, or null if
 * none of `examNames` is a plausible match. Among names that fully match, prefers the one with the
 * fewest leftover tokens (the most specific one). */
export function matchApExamName(examRaw: string, examNames: string[]): string | null {
  const examTokens = normalizeTokens(preprocess(examRaw));
  if (examTokens.length === 0) return null;

  let best: { name: string; leftover: number } | null = null;
  for (const name of examNames) {
    const nameTokens = normalizeTokens(name);
    if (!allTokensMatch(examTokens, nameTokens)) continue;
    const leftover = nameTokens.length - examTokens.length;
    if (!best || leftover < best.leftover) best = { name, leftover };
  }
  return best?.name ?? null;
}

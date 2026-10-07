// Gen Ed text helpers with no HTML dependency, so the plan package can use them in the browser.

/** Testudo's "DSNL (if taken with CHEM132), DSNS" -> the DSNL condition, kept out of the flat genEd list. */
export function labPairOf(genEdText: string): { labPair?: { code: "DSNL"; with: string } } {
  const m = /\bDSNL\s*\(\s*if taken with\s+([A-Z]{4}\d{3}[A-Z]?)\s*\)/i.exec(genEdText);
  return m ? { labPair: { code: "DSNL", with: m[1]!.toUpperCase() } } : {};
}

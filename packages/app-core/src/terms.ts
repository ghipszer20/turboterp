// Term names ("Fall 2026", "Winter 2027", …) as the plan checker reads them, and their order.
// Winter Y runs in January of year Y, between Fall Y-1 and Spring Y.

export type Season = "Fall" | "Winter" | "Spring" | "Summer";

const ORDER: Record<Season, number> = { Winter: 0, Spring: 1, Summer: 2, Fall: 3 };
const TESTUDO_MONTH: Record<Season, string> = { Spring: "01", Summer: "05", Fall: "08", Winter: "12" };
const SEASON_FROM_MONTH: Record<string, Season> = { "01": "Spring", "05": "Summer", "08": "Fall", "12": "Winter" };

export function parseTerm(name: string): { season: Season; year: number } | null {
  const m = /^(Fall|Winter|Spring|Summer) (\d{4})$/.exec(name.trim());
  return m ? { season: m[1] as Season, year: Number(m[2]) } : null;
}

const key = (name: string) => {
  const t = parseTerm(name);
  return t ? t.year * 4 + ORDER[t.season] : Number.MAX_SAFE_INTEGER;
};

export const compareTerms = (a: string, b: string) => key(a) - key(b);

export const sortTerms = (names: string[]) => [...names].sort(compareTerms);

/** Eight fall and spring terms, starting with `start`. */
export function defaultTerms(start: string, count = 8): string[] {
  const t = parseTerm(start);
  if (!t) return [];
  const out: string[] = [];
  let { season, year } = t;
  while (out.length < count) {
    out.push(`${season} ${year}`);
    if (season === "Fall") {
      season = "Spring";
      year += 1;
    } else season = "Fall";
  }
  return out;
}

/** The academic year a term belongs to, by the year its fall starts in. */
function academicYearStart(name: string): number {
  const t = parseTerm(name)!;
  return t.season === "Fall" ? t.year : t.year - 1;
}

/** Terms grouped by academic year ("2026–27": Fall 2026, Winter 2027, Spring 2027, Summer 2027). */
export function academicYears(names: string[]): { label: string; terms: string[] }[] {
  const years: { label: string; start: number; terms: string[] }[] = [];
  for (const name of sortTerms(names)) {
    if (!parseTerm(name)) continue;
    const start = academicYearStart(name);
    let year = years.find((y) => y.start === start);
    if (!year) {
      year = { label: `${start}–${String(start + 1).slice(-2)}`, start, terms: [] };
      years.push(year);
    }
    year.terms.push(name);
  }
  return years.map(({ label, terms }) => ({ label, terms }));
}

/** Testudo term id (YYYYMM), e.g. "Fall 2026" → "202608". */
export function matriculationTermId(name: string): string | null {
  const t = parseTerm(name);
  return t ? `${t.year}${TESTUDO_MONTH[t.season]}` : null;
}

/** Inverse of matriculationTermId, e.g. "202701" → "Spring 2027"; null for an unrecognized id. */
export function termFromMatriculationId(id: string): string | null {
  const m = /^(\d{4})(\d{2})$/.exec(id);
  if (!m) return null;
  const season = SEASON_FROM_MONTH[m[2]!];
  return season ? `${season} ${m[1]}` : null;
}

/** Fall and spring start terms from four years back to two years ahead. */
export function startTermOptions(currentYear: number): string[] {
  const out: string[] = [];
  for (let y = currentYear - 4; y <= currentYear + 2; y++) {
    if (y > currentYear - 4) out.push(`Spring ${y}`);
    out.push(`Fall ${y}`);
  }
  return out;
}

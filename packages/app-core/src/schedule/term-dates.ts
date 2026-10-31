// Class dates per term, hand-entered from the UMD Academic Calendar
// (https://provost.umd.edu/calendar, checked 2026-09-28). Term codes are YYYYMM (202608 = Fall 2026).
// Dates are "YYYY-MM-DD" calendar days; `noClasses` lists each individual day off inside the term.

export type TermDates = { first: string; last: string; noClasses: string[] };

const range = (from: string, to: string): string[] => {
  const out: string[] = [];
  for (let d = new Date(`${from}T00:00:00Z`); d <= new Date(`${to}T00:00:00Z`); d = new Date(d.getTime() + 86_400_000)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
};

export const TERM_DATES: Record<string, TermDates> = {
  // Fall 2026: Labor Day, Fall Break (Oct 12-13), Thanksgiving (Nov 25-29).
  "202608": {
    first: "2026-08-31",
    last: "2026-12-11",
    noClasses: ["2026-09-07", ...range("2026-10-12", "2026-10-13"), ...range("2026-11-25", "2026-11-29")],
  },
  // Spring 2027: Spring Break (Mar 14-21).
  "202701": { first: "2027-01-27", last: "2027-05-11", noClasses: range("2027-03-14", "2027-03-21") },
};

export const termDates = (term: string): TermDates | null => TERM_DATES[term] ?? null;

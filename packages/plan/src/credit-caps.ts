// UMD's per-term undergraduate credit-load caps, by college and season. Researched from
// umd.edu only (registrar, Extended Studies, and each college's own advising/policy pages); see
// docs/project/credit-caps.md for the full table, exact quotes and "not found" notes. Owner
// ruling ("Credit caps per term", docs/project/rulings.md): the cap depends on the student's
// college and the term; cite a source for each; don't guess.

import type { Season } from "./check.ts";

export type College = "AGNR" | "ARCH" | "ARHU" | "BSOS" | "BMGT" | "CMNS" | "EDUC" | "ENGR" | "INFO" | "JOUR" | "PLCY" | "SPHL" | "UGST" | "USG";

/** Full names, for picker UI and issue messages. "UGST" (Undergraduate Studies) is TurboTerp's
 * own short code -- UMD's own catalog just calls it "Office of Undergraduate Studies". */
export const COLLEGES: { code: College; name: string }[] = [
  { code: "AGNR", name: "Agriculture and Natural Resources" },
  { code: "ARCH", name: "Architecture, Planning and Preservation" },
  { code: "ARHU", name: "Arts and Humanities" },
  { code: "BMGT", name: "Robert H. Smith School of Business" },
  { code: "BSOS", name: "Behavioral and Social Sciences" },
  { code: "CMNS", name: "Computer, Mathematical, and Natural Sciences" },
  { code: "EDUC", name: "Education" },
  { code: "ENGR", name: "A. James Clark School of Engineering" },
  { code: "INFO", name: "Information" },
  { code: "JOUR", name: "Philip Merrill College of Journalism" },
  { code: "PLCY", name: "School of Public Policy" },
  { code: "SPHL", name: "Public Health" },
  { code: "UGST", name: "Undergraduate Studies" },
  { code: "USG", name: "Universities at Shady Grove" },
];

export const collegeName = (college: College): string => COLLEGES.find((c) => c.code === college)!.name;

export type CreditCapEntry = {
  max: number;
  /** Who has to approve going over `max`. UMD's own pages call this "the college dean" almost
   * everywhere a specific title is given; a few (e.g. the Fall/Spring catalog rule) say only
   * "Advising College", which resolves through the same dean's-exception process in practice. */
  approval: "dean" | "advisor" | null;
  /** The umd.edu page this number is cited from (see docs/project/credit-caps.md for the quote). */
  source: string;
};

const REGISTRATION_URL = "https://academiccatalog.umd.edu/undergraduate/registration-academic-requirements-regulations/registration/";
const WINTER_URL = "https://exst.umd.edu/current-incoming-former-umd-students/winter-session/university-policies";
const SUMMER_URL = "https://exst.umd.edu/current-incoming-former-umd-students/summer-session/university-policies";
const CMNS_URL = "https://cmns.umd.edu/undergraduate/current-students/advising-academic-planning/academic-policies";
const ENGR_URL = "https://eng.umd.edu/services/academic-policies";

/**
 * The campus-wide default, used whenever a college has no override for that season (which is
 * every college for Winter and Summer, and every college but CMNS and ENGR for Fall/Spring).
 *
 * Summer models the stated Summer Total (16), not the two 8-credit sessions, because the Plan's
 * term grid (apps/web/lib/advisor/terms.ts) has one "Summer YYYY" term, not separate Session I /
 * Session II terms -- see docs/project/credit-caps.md's "Modeling note". If the grid ever splits
 * into sessions, this should switch to the per-session 8-credit figure instead.
 */
const CAMPUS_DEFAULT: Record<Season, CreditCapEntry> = {
  Fall: { max: 20, approval: "dean", source: REGISTRATION_URL },
  Spring: { max: 20, approval: "dean", source: REGISTRATION_URL },
  Winter: { max: 4, approval: "dean", source: WINTER_URL },
  Summer: { max: 16, approval: "dean", source: SUMMER_URL },
};

/**
 * College-specific overrides. Only Fall/Spring are overridden anywhere in this research: CMNS and
 * ENGR each state their own, lower term maximum (their Winter/Summer pages restate the campus
 * default verbatim, so those seasons are left out here and fall through to CAMPUS_DEFAULT).
 */
const CREDIT_CAPS: Partial<Record<College, Partial<Record<Season, CreditCapEntry>>>> = {
  // "CMNS Maximum credit limit: Students may take a maximum of 17 credits per fall or spring
  // semester..." -- cmns.umd.edu/undergraduate/current-students/advising-academic-planning/academic-policies
  CMNS: {
    Fall: { max: 17, approval: "dean", source: CMNS_URL },
    Spring: { max: 17, approval: "dean", source: CMNS_URL },
  },
  // "Up to 18 credits during the fall semester... Up to 18 credits during the spring semester...
  // The credit limits listed above are established college policies." -- eng.umd.edu/services/academic-policies
  ENGR: {
    Fall: { max: 18, approval: "dean", source: ENGR_URL },
    Spring: { max: 18, approval: "dean", source: ENGR_URL },
  },
};

/** The credit cap for a college and season, falling back to the campus-wide default when the
 * college is unknown or has no override for that season. */
export function creditCap(college: College | undefined, season: Season): CreditCapEntry & { isDefault: boolean } {
  const override = college ? CREDIT_CAPS[college]?.[season] : undefined;
  return override ? { ...override, isDefault: false } : { ...CAMPUS_DEFAULT[season], isDefault: true };
}

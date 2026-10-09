// How to reserve RecWell courts, the Bouldering Zone, the climbing wall and
// fields. Static on purpose: every fact comes from RecWell's own pages
// (docs/project/recwell-signups.md, checked 2026-10-09).
//
// Hard rules (owner/legal): we only LINK to activeterp.umd.edu and planyo.com.
// We never fetch, scrape or automate them (ActiveTerp's robots.txt disallows
// every crawler except Googlebot, and booking needs the student's own UMD
// sign-in), and we never ask for or handle UMD credentials.

export const RESERVE_AS_OF = "2026-10-09";

const COURT_RESERVATIONS = "https://recwell.umd.edu/facilities/court-reservations";
const CLIMBING_WALL = "https://recwell.umd.edu/programs-activities/adventure-program/climbing-wall-bouldering-grotto";
const BOULDERING_ZONE = "https://recwell.umd.edu/programs-activities/adventure-program/bouldering-zone";

export type ReserveLink = { label: string; url: string };

export type ReserveCard = {
  id: "tennis" | "courts" | "bouldering" | "pickleball" | "climbing" | "fields";
  title: string;
  /** One line on how it works. */
  summary: string;
  /** The rules, in plain words. */
  rules: string;
  /** Where to book. Empty when nothing can be booked. */
  links: ReserveLink[];
  /** The RecWell page this card's facts come from. */
  sourceUrl: string;
  asOf: string;
};

export const RESERVE_CARDS: ReserveCard[] = [
  {
    id: "tennis",
    title: "Tennis courts",
    summary: "Eppley's 8 lighted courts. Book on Planyo.",
    rules: "Reservations recommended. Book 48 hours ahead; 1 court and 2 hours a day.",
    links: [{ label: "Book on Planyo", url: "https://www.planyo.com/booking.php?calendar=36698" }],
    sourceUrl: COURT_RESERVATIONS,
    asOf: RESERVE_AS_OF,
  },
  {
    id: "courts",
    title: "Racquetball, wallyball and squash",
    summary: "Eppley courts. Book on ActiveTerp.",
    rules: "Reservations recommended. Sign in with your UMD account on ActiveTerp.",
    links: [{ label: "Book on ActiveTerp", url: "https://activeterp.umd.edu/booking" }],
    sourceUrl: COURT_RESERVATIONS,
    asOf: RESERVE_AS_OF,
  },
  {
    id: "bouldering",
    title: "Bouldering Zone",
    summary: "The indoor bouldering area. Book on ActiveTerp.",
    rules: "Reservations open 24 hours ahead.",
    links: [{ label: "Book on ActiveTerp", url: "https://activeterp.umd.edu/booking" }],
    sourceUrl: BOULDERING_ZONE,
    asOf: RESERVE_AS_OF,
  },
  {
    id: "pickleball",
    title: "Pickleball",
    summary: "16 courts at the Eppley tennis complex.",
    rules: "Drop-in play only, no reservations. Priority on select courts Tuesday, Thursday and Sunday evenings.",
    links: [],
    sourceUrl: COURT_RESERVATIONS,
    asOf: RESERVE_AS_OF,
  },
  {
    id: "climbing",
    title: "Outdoor climbing wall",
    summary: "Run by the Adventure Program. No booking for regular use.",
    rules:
      "Check in with your UMD ID. A private rental is by request form at least 3 weeks ahead, from $250.",
    links: [{ label: "Climbing wall and rental form", url: CLIMBING_WALL }],
    sourceUrl: CLIMBING_WALL,
    asOf: RESERVE_AS_OF,
  },
  {
    id: "fields",
    title: "Fields",
    summary: "For organizations only.",
    rules: "Individuals can't reserve fields. Organizations book through RecWell's scheduling system.",
    links: [{ label: "RecWell scheduling (organizations)", url: "https://scheduling.crs.umd.edu" }],
    sourceUrl: "https://scheduling.crs.umd.edu",
    asOf: RESERVE_AS_OF,
  },
];

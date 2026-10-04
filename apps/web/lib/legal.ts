// Plain-language Terms of Use and Privacy notice, as data. First drafts, no lawyer review
// (docs/project/legal.md). Bump the version whenever the meaning changes.

export const TERMS_VERSION = "2026-09-29";
export const PRIVACY_VERSION = "2026-09-29";

export type LegalSection = { heading: string; paragraphs: string[] };

/** Every localStorage key the app writes. The privacy text must name each one. */
export const STORAGE_KEYS = [
  "turboterp-advisor-plan",
  "turboterp-advisor-consent",
  "turboterp-schedule",
  "turboterp-leave-origin",
  "turboterp-theme",
] as const;

export const TERMS: LegalSection[] = [
  {
    heading: "What TurboTerp is",
    paragraphs: [
      "TurboTerp is a free, open-source app made by a UMD student. It brings campus info, a schedule builder, a four-year plan and a degree audit into one place.",
      "The code is released under the Apache-2.0 license. These terms cover using the app and website, not the code.",
    ],
  },
  {
    heading: "Unofficial and not affiliated",
    paragraphs: [
      "TurboTerp is not affiliated with, endorsed by or run by the University of Maryland. It never asks for your Testudo credentials, and it never registers you for anything.",
    ],
  },
  {
    heading: "Not academic advising",
    paragraphs: [
      "Nothing here is academic advising. That includes the Advisor, the planner, the degree audit, credit estimates, pre-professional tracks and any suggestions or feedback.",
      "Before you use the Advisor, it asks you to read a short agreement and sign it by typing your name. That agreement covers the same ground as this page, in more detail.",
    ],
  },
  {
    heading: "Data may be wrong or out of date",
    paragraphs: [
      "Catalog rules, courses, times, grades and campus info change, and we can get things wrong. Where it matters, TurboTerp shows the catalog year it used.",
    ],
  },
  {
    heading: "Your responsibility to check",
    paragraphs: [
      "You are responsible for confirming everything with your academic advisor and UMD's official degree audit before you register, drop a course or change programs.",
    ],
  },
  {
    heading: "No warranty",
    paragraphs: [
      "TurboTerp is provided as is and as available, with no promises about accuracy, completeness or uptime, and no warranty of any kind.",
    ],
  },
  {
    heading: "Limitation of liability",
    paragraphs: [
      "To the fullest extent the law allows, the people who make TurboTerp are not liable for any loss that comes from using it or relying on it. That includes extra semesters, tuition, fees, missed deadlines or other costs.",
    ],
  },
  {
    heading: "Acceptable use",
    paragraphs: [
      "Please don't scrape the site, overload it, or try to break or misuse it. Use it for yourself and be kind to the shared services it depends on.",
    ],
  },
  {
    heading: "Third-party data",
    paragraphs: [
      "TurboTerp shows data from other sources: UMD's Schedule of Classes, PlanetTerp, campus dining, LibCal, RecWell and Shuttle-UM GTFS. Each stays the property of its owner.",
      "Shuttle-UM GTFS data is used under the Interline license, for non-commercial educational use.",
    ],
  },
  {
    heading: "Changes to these terms",
    paragraphs: [
      "We may update these terms. The version date at the top changes when we do. If the Advisor agreement changes in a way that matters, it asks you to sign again.",
    ],
  },
];

export const PRIVACY: LegalSection[] = [
  {
    heading: "The short version",
    paragraphs: [
      "Only the Advisor uses an account, and it holds just your UMD email address. What you enter stays in your browser. No analytics, no ads, no tracking cookies, and nothing is sold.",
    ],
  },
  {
    heading: "What is stored in your browser",
    paragraphs: [
      "TurboTerp saves a few things on your device using your browser's local storage. None of it is sent to us.",
      "turboterp-advisor-plan: your four-year plan.",
      "turboterp-advisor-consent: your signed Advisor agreement (version, date and typed name).",
      "turboterp-schedule: your saved schedule.",
      "turboterp-leave-origin: the building you chose as your starting point for leave-by times.",
      "turboterp-theme: your light or dark choice.",
      "Clearing your site data in the browser deletes all of it.",
    ],
  },
  {
    heading: "Transcripts",
    paragraphs: [
      "If you add a transcript PDF, it is read in your browser, including text recognition (OCR) for scanned pages. The file is never uploaded.",
    ],
  },
  {
    heading: "Tracking",
    paragraphs: ["No analytics, no ads and no tracking cookies. We don't sell or share personal data."],
  },
  {
    heading: "Maps and location",
    paragraphs: [
      "Map tiles are loaded from OpenFreeMap, so it sees your IP address like any site you load images from.",
      "Your location is used only when you tap a button like \"Show my location\", and it isn't stored.",
      "When you plan a trip, its start and end points (which can be your location) are sent to our server to find buses. They're used for that request only and aren't saved.",
      "Like any website, our host may keep short-lived request logs (such as IP address and the page requested) to run the service.",
    ],
  },
  {
    heading: "Signing in",
    paragraphs: [
      "Only the Advisor needs an account. Campus, Schedule and Today work without one.",
      "When you sign in, your UMD email address is stored with our sign-in provider, Supabase, so we can send you a sign-in link. We never ask for or store your Testudo password.",
    ],
  },
  {
    heading: "Coming next: your plan on every device (planned)",
    paragraphs: [
      "We plan to store your plan and your signed agreement (version, time, account and a hash of the typed name) on our server, tied to your account, so they follow you between devices.",
      "You will be able to delete it all with one tap. This page will be updated before that starts.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: ["Questions or a deletion request? Use the report and contact options on the About page."],
  },
  {
    heading: "Changes to this notice",
    paragraphs: ["If this changes, the version date at the top changes too."],
  },
];

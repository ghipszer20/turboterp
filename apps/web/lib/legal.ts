// Plain-language Terms of Use and Privacy Policy, as data. No lawyer review
// (docs/project/legal.md). Bump the version whenever the meaning changes.

export const TERMS_VERSION = "2026-10-09";
export const PRIVACY_VERSION = "2026-10-09";

/** A paragraph, or a list of bullet points. */
export type LegalBlock = string | string[];
export type LegalSection = { heading: string; paragraphs: LegalBlock[] };

/** "2026-10-04" → "October 4, 2026", for the "Last updated" line. */
export function formatVersion(version: string): string {
  return new Date(`${version}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", year: "numeric", month: "long", day: "numeric" });
}

/** Every localStorage key the app writes. The privacy text must name each one. */
export const STORAGE_KEYS = [
  "turboterp-advisor-plan",
  "turboterp-advisor-consent",
  "turboterp-schedule",
  "turboterp-registration",
  "turboterp-leave-origin",
  "turboterp-theme",
  "turboterp-sync",
] as const;

export const TERMS: LegalSection[] = [
  {
    heading: "Introduction",
    paragraphs: [
      "Welcome to TurboTerp. These Terms of Use (\"Terms\") cover your use of the TurboTerp website and app. By using TurboTerp, you agree to these Terms. If you don't agree, please don't use it.",
    ],
  },
  {
    heading: "What TurboTerp is",
    paragraphs: [
      "TurboTerp is a free, open-source app made by a UMD student. It brings campus info, a schedule builder, an academic calendar, a four-year plan and a degree audit into one place.",
      "It is a student project. It has no ads and no paid features, and it is not a business.",
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
      "Before you use the Advisor, it asks you to read a short agreement and sign it by typing your name. That agreement covers the same ground as this page, in more detail, and it applies on top of these Terms.",
    ],
  },
  {
    heading: "Data may be wrong or out of date",
    paragraphs: [
      "Catalog rules, courses, seats, times, grades, dates and campus info change, and we can get things wrong. Where it matters, TurboTerp shows the catalog year it used.",
      "TurboTerp does not guarantee that anything it shows is accurate, complete or current. Nothing on it is an official university record.",
    ],
  },
  {
    heading: "Your responsibility to check",
    paragraphs: [
      "You are responsible for confirming everything with your academic advisor and UMD's official degree audit before you register, drop a course or change programs. Check official UMD sources for deadlines, hours and schedules that matter to you.",
    ],
  },
  {
    heading: "Accounts",
    paragraphs: [
      "You can use TurboTerp without an account. If you make one, you sign in with Google or with a link sent to your email address, so keep that account or inbox secure and use an address that is yours.",
      "We may suspend or remove an account that is used to misuse the site. You can delete your account yourself at any time with the Delete account button next to Sign out in the Advisor. If you can't use it, ask us through the Report an issue page.",
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
      "Please don't scrape the site, overload it, or try to break or misuse it. Don't try to get into data or accounts that aren't yours. Use it for yourself and be kind to the shared services it depends on.",
    ],
  },
  {
    heading: "Intellectual property",
    paragraphs: [
      "TurboTerp's code is open source under the Apache-2.0 license, which sets the rules for using the code. These Terms cover using the hosted app and website, not the code.",
      "The TurboTerp name and logo belong to the project. Please don't use them in a way that suggests your own project is TurboTerp or is endorsed by it.",
      "Anything you enter, such as your plan and your schedule, stays yours.",
    ],
  },
  {
    heading: "Third-party data",
    paragraphs: [
      "TurboTerp shows data from other sources: UMD's Schedule of Classes and Academic Catalog, PlanetTerp, campus dining, LibCal, RecWell and Shuttle-UM. Each stays the property of its owner and is subject to that owner's terms.",
      "Grade distributions and professor ratings come from PlanetTerp. They are shown as is and are not an official university record.",
      "Shuttle-UM GTFS data is used under the Interline license, for non-commercial educational use.",
    ],
  },
  {
    heading: "Donations",
    paragraphs: [
      "Donations are voluntary and only help cover running costs, such as hosting and the domain. A donation buys nothing: no features, no perks and no priority. Donations are gifts and are not tax-deductible.",
    ],
  },
  {
    heading: "Changes to these Terms",
    paragraphs: [
      "We may update these Terms at any time. The date at the top changes when we do. If you keep using TurboTerp after a change, you agree to the updated Terms. If the Advisor agreement changes in a way that matters, it asks you to sign again.",
    ],
  },
  {
    heading: "Governing law",
    paragraphs: [
      "These Terms are governed by the laws of Maryland, United States, without regard to its conflict of law rules.",
    ],
  },
  {
    heading: "Contact us",
    paragraphs: [
      "Questions about these Terms? Reach us through the Report an issue page, linked below.",
      "By using TurboTerp, you acknowledge that you have read, understood and agree to these Terms.",
    ],
  },
];

export const PRIVACY: LegalSection[] = [
  {
    heading: "Introduction",
    paragraphs: [
      "This Privacy Policy explains what TurboTerp collects, where it is kept and what we do with it.",
      "The short version: an account is optional. Without one, your plan and schedule stay in your browser. When you sign in, they are also saved to your account so they follow you between devices. No analytics, no ads, no tracking cookies, and nothing is sold.",
    ],
  },
  {
    heading: "What we collect",
    paragraphs: [
      "An account is optional. Campus, Schedule, Calendar, Today and the Advisor all work without one.",
      "If you sign in, we collect your email address. Any email address works; it doesn't have to be a UMD one. There is no password: you sign in with Google, or with a link sent to your address. If you use Google, we get your email address and basic profile from Google, and nothing else.",
      "We use your email address only to sign you in and to tell your account apart from others. While you are signed in, your plan, saved schedules and registration checklist are also stored on our server (see \"Your plan on every device\" below). We don't send newsletters or marketing email.",
      "We never ask for or store your Testudo password or your UID, and we never see your official UMD records.",
    ],
  },
  {
    heading: "What is stored in your browser",
    paragraphs: [
      "TurboTerp saves a few things on your device using your browser's local storage. Without an account, none of it is sent to us. When you are signed in, the plan, schedules and checklist are also saved to your account.",
      [
        "turboterp-advisor-plan: your four-year plan, including the courses, grades and credit you entered.",
        "turboterp-advisor-consent: your signed Advisor agreement (version, date and typed name).",
        "turboterp-schedule: your saved schedule.",
        "turboterp-registration: your registration checklist and the registration appointment time you typed in.",
        "turboterp-leave-origin: the building you chose as your starting point for leave-by times.",
        "turboterp-theme: your light or dark choice.",
        "turboterp-sync: which version of your plan and schedules this browser last saved to your account, when you're signed in. Signing out removes the synced copies from that browser.",
      ],
      "If you are signed in, our sign-in provider's code also keeps a sign-in token there, so you stay signed in on that device.",
      "Clearing your site data in the browser deletes all of it.",
    ],
  },
  {
    heading: "Transcripts",
    paragraphs: [
      "If you add a transcript PDF, it is read in your browser, including text recognition (OCR) for scanned pages. The file is never uploaded, and we never see it.",
    ],
  },
  {
    heading: "Cookies and tracking",
    paragraphs: [
      "No analytics, no ads and no tracking cookies.",
      "While the site is in preview, entering the access code sets one cookie, tt_access, so that browser stays let in for 180 days. It holds a scrambled copy of the code and nothing about you.",
    ],
  },
  {
    heading: "Maps and location",
    paragraphs: [
      "Your location is used only when you tap a button like \"Show my location\", and it isn't stored.",
      "When you plan a trip, its start and end points (which can be your location) are sent to our server to find buses. They're used for that request only and aren't saved.",
    ],
  },
  {
    heading: "How your data is used and shared",
    paragraphs: [
      "Your data is used only to run TurboTerp for you. We do not sell, rent or give away your email address or anything else about you, to advertisers, data brokers or anyone else.",
      "The only others that handle it are the services listed below, and only as far as running the site needs.",
    ],
  },
  {
    heading: "Other services involved",
    paragraphs: [
      [
        "Supabase runs sign-in and the database, in the United States. It stores your email address, your synced plan and schedules, and the agreement records, and sends the email with your sign-in link.",
        "Google, if you choose Continue with Google, signs you in and tells us your email address and basic profile. Google's own privacy policy applies to that sign-in.",
        "Brevo sends email for us: sign-in emails, issue reports and the plan emails you ask for. It sees the address it sends to and the message it carries.",
        "Vercel hosts the website. Like any web host, it may keep short-lived request logs (such as IP address and the page requested) to run and protect the service.",
        "OpenFreeMap serves the map tiles, so it sees your IP address when a map loads, like any site you load images from.",
      ],
      "Links to other sites, such as UMD pages, LibCal and Testudo, take you to services with their own privacy policies.",
    ],
  },
  {
    heading: "Reports and donations",
    paragraphs: [
      "Report an issue sends what you type from our server, through Brevo, to us. A report email holds what you wrote, the page you named, your email address only if you typed one, and the time it was sent. Issues filed on GitHub are public.",
      "Email my plan sends your 4-year plan as a PDF, with a short summary of your audit, only to your own address, the one you signed in with. Nothing is sent to any other address.",
      "To stop abuse, we keep a rate-limit record for each report or plan email: a scrambled copy of your IP address (reports) or account id (plan emails) and the time. It is deleted after a day.",
      "Donations go through Venmo, under Venmo's own privacy policy. We never see your card or bank details. We see what Venmo shows the person receiving a payment: your Venmo name, the amount and any note.",
    ],
  },
  {
    heading: "Your plan on every device",
    paragraphs: [
      "When you are signed in, your plan, saved schedules and registration checklist are stored on our server (Supabase), tied to your account, so they follow you between devices. While you are signed in, the newest change wins: each edit is saved and replaces the older copy, on every device. If this browser already has a plan made before you signed in and your account has a different one, we ask which to keep.",
      "When you sign the Advisor agreement, we also keep a record of it: its version, the time, a random id for your browser, your account if you are signed in, and the name you typed. The name is stored encrypted so that only we can read it, and only if it is needed as a legal record.",
      "Signing out removes the synced copies from that browser. Your signed agreement stays on the device.",
      "Seat Alerts: the classes you watch and, if you turn on notifications, your browser's push address (from Apple, Google or Mozilla). Deleted with your account.",
    ],
  },
  {
    heading: "Deleting your data",
    paragraphs: [
      "Everything in your browser is yours to delete: clear the site's data in your browser settings.",
      "To delete your account, tap Delete account next to Sign out in the Advisor and confirm. That removes your account, your email address and your saved plans and schedules from our server. Your signed agreement record is kept as a legal record, without any link to your account. If you can't use the button, ask us through the Report an issue page, linked below, from the address the account uses.",
    ],
  },
  {
    heading: "Data security",
    paragraphs: [
      "The site is served over an encrypted connection, and account data is kept with a provider that encrypts it in transit and at rest. Keys and passwords for these services are kept out of the public code. No system is perfectly secure, so we keep as little about you as we can.",
    ],
  },
  {
    heading: "Children",
    paragraphs: ["TurboTerp is made for college students. It is not meant for children under 13, and we don't knowingly collect their data."],
  },
  {
    heading: "Changes to this policy",
    paragraphs: [
      "We may update this policy. The date at the top changes when we do. If we start collecting something new or using your data in a new way, this page is updated before that starts.",
    ],
  },
  {
    heading: "Contact us",
    paragraphs: ["Questions, or a request to delete your data? Reach us through the Report an issue page, linked below."],
  },
];

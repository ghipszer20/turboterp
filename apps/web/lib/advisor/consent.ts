// The Advisor's typed-name agreement (PROJECT_MEMORY section 11). Stored per device for now; the
// server-side record (account, timestamp, hash of the name) comes with accounts.
// Bump CONSENT_VERSION whenever the wording changes materially: everyone is asked again.

export const CONSENT_VERSION = "2026-09-26";

export const CONSENT_TITLE = "Before you plan";

/** Plain-language terms, shown in full before the student signs. */
export const CONSENT_POINTS: { title: string; body: string }[] = [
  {
    title: "Unofficial",
    body: "TurboTerp is a student project. It isn't affiliated with, or endorsed by, the University of Maryland.",
  },
  {
    title: "Not advising",
    body: "Your plan, audit, credit estimates and any suggestions here are not academic advising. They can contain mistakes or outdated catalog information.",
  },
  {
    title: "You check it",
    body: "You're responsible for your academic decisions. Confirm with your advisor and UMD's official degree audit before you register, change programs or plan to graduate.",
  },
  {
    title: "No warranty",
    body: "TurboTerp is provided as is, with no warranty. Its makers aren't liable for anything that follows from relying on it, such as an extra semester, extra costs or a missed deadline.",
  },
  {
    title: "Applies to all of Advisor",
    body: "These terms apply to everything in the Advisor tab, including your plan, audit, AP/IB and transfer credit, pre-professional tracks, and any suggestions or AI feedback.",
  },
  {
    title: "Pre-professional tracks",
    body: "Guidance for pre-professional tracks (like pre-med or pre-law) is general. Requirements differ from one professional program to the next, so confirm them yourself with the specific programs you're interested in.",
  },
];

export const CONSENT_CHECKBOX = "I've read this and understand TurboTerp is not official advising.";

export type ConsentRecord = { name: string; acceptedAt: string; version: string };

export const CONSENT_STORAGE_KEY = "turboterp-advisor-consent";

export function acceptConsent(
  typedName: string,
  ticked: boolean,
  now: Date,
): { ok: true; record: ConsentRecord } | { ok: false; error: string } {
  const name = typedName.trim().replace(/\s+/g, " ");
  if (name.length < 2) return { ok: false, error: "Type your full name to sign." };
  if (!ticked) return { ok: false, error: "Tick the box to confirm you've read it." };
  return { ok: true, record: { name, acceptedAt: now.toISOString(), version: CONSENT_VERSION } };
}

export function parseConsent(raw: string | null): ConsentRecord | null {
  if (!raw) return null;
  try {
    const r = JSON.parse(raw) as Partial<ConsentRecord> | null;
    if (!r || typeof r.name !== "string" || r.name.trim().length < 2) return null;
    if (typeof r.acceptedAt !== "string" || typeof r.version !== "string") return null;
    return { name: r.name, acceptedAt: r.acceptedAt, version: r.version };
  } catch {
    return null;
  }
}

export const hasConsent = (record: ConsentRecord | null) => record !== null && record.version === CONSENT_VERSION;

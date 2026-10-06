// Config for the About page. The owner hasn't supplied a bio, donation link,
// contact email, or public GitHub URL yet -- every field below is a
// placeholder until an owner (see the OWNER comments) fills it in.
//
// A page or link that depends on a placeholder must never render as a dead
// link/button: use resolveAbout() and check for null before showing it.

export type AboutConfig = {
  creatorBio: string;
  githubUrl: string;
  donationUrl: string;
  venmoHandle: string;
  contactEmail: string;
};

const PLACEHOLDER = "__OWNER_FILL_IN__";

export const ABOUT: AboutConfig = {
  // OWNER: replace with a short bio for the "About the creator" section.
  creatorBio: PLACEHOLDER,
  // OWNER: replace with the public GitHub repo URL, e.g. "https://github.com/you/turboterp".
  githubUrl: PLACEHOLDER,
  // OWNER (Venmo account "turboterp", owner 2026-10-04): donations go to Venmo.
  donationUrl: "https://venmo.com/u/turboterp",
  venmoHandle: "@turboterp",
  // OWNER: replace with the contact email once it's created.
  contactEmail: PLACEHOLDER,
};

export function isPlaceholder(value: string): boolean {
  return value === PLACEHOLDER;
}

export type ResolvedAbout = {
  bio: string | null;
  githubUrl: string | null;
  issuesUrl: string | null;
  donationUrl: string | null;
  venmoHandle: string | null;
  contactEmail: string | null;
};

/** Turns raw config into display-ready values, with placeholders resolved to null. */
export function resolveAbout(cfg: AboutConfig): ResolvedAbout {
  const githubUrl = isPlaceholder(cfg.githubUrl) ? null : cfg.githubUrl;
  return {
    bio: isPlaceholder(cfg.creatorBio) ? null : cfg.creatorBio,
    githubUrl,
    issuesUrl: githubUrl ? `${githubUrl.replace(/\/+$/, "")}/issues/new` : null,
    donationUrl: isPlaceholder(cfg.donationUrl) ? null : cfg.donationUrl,
    venmoHandle: isPlaceholder(cfg.venmoHandle) ? null : cfg.venmoHandle,
    contactEmail: isPlaceholder(cfg.contactEmail) ? null : cfg.contactEmail,
  };
}

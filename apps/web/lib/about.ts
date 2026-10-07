// Config for the About page. The owner hasn't supplied a public GitHub
// URL yet -- that field is a placeholder until an owner (see the OWNER
// comments) fills it in.
//
// A page or link that depends on a placeholder must never render as a dead
// link/button: use resolveAbout() and check for null before showing it.

export type AboutConfig = {
  githubUrl: string;
  donationUrl: string;
  venmoHandle: string;
  contactEmail: string;
};

const PLACEHOLDER = "__OWNER_FILL_IN__";

export const ABOUT: AboutConfig = {
  // OWNER: replace with the public GitHub repo URL, e.g. "https://github.com/you/turboterp".
  githubUrl: PLACEHOLDER,
  // OWNER (Venmo account "turboterp", owner 2026-10-04): donations go to Venmo.
  donationUrl: "https://venmo.com/u/turboterp",
  venmoHandle: "@turboterp",
  // OWNER (2026-10-07): the public contact email.
  contactEmail: "turboterpadmin@gmail.com",
};

export function isPlaceholder(value: string): boolean {
  return value === PLACEHOLDER;
}

export type ResolvedAbout = {
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
    githubUrl,
    issuesUrl: githubUrl ? `${githubUrl.replace(/\/+$/, "")}/issues/new` : null,
    donationUrl: isPlaceholder(cfg.donationUrl) ? null : cfg.donationUrl,
    venmoHandle: isPlaceholder(cfg.venmoHandle) ? null : cfg.venmoHandle,
    contactEmail: isPlaceholder(cfg.contactEmail) ? null : cfg.contactEmail,
  };
}

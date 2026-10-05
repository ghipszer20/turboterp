// Pre-launch gate (owner, 2026-10-04): until TurboTerp is ready, visitors see a "Coming soon"
// page and only someone with the access code gets in. Set SITE_ACCESS_CODE on the server to
// turn the gate on; leave it unset (local development, and at launch) and everyone gets in.

export const ACCESS_COOKIE = "tt_access";
export const COMING_SOON_PATH = "/coming-soon";

/** What the cookie holds: a hash of the code, so the code itself never sits in the browser. */
export async function accessToken(code: string): Promise<string> {
  const bytes = new TextEncoder().encode(`turboterp-access:${code}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Reachable without the code: the Coming Soon page and its code check, the scheduled refresh
// jobs (they carry their own secret), and the files a browser asks for on any page.
const OPEN_EXACT = new Set([COMING_SOON_PATH, "/api/access", "/icon.svg", "/apple-icon", "/manifest.webmanifest", "/robots.txt", "/favicon.ico"]);
const OPEN_PREFIXES = ["/api/cron/", "/_next/"];
// Data, not pages: answer "no" rather than redirecting a fetch to an HTML page.
const DATA_PREFIXES = ["/api/", "/data/"];

export type GateDecision = "allow" | "coming-soon" | "deny";

/** `token`: the expected cookie value, or null when no access code is configured. */
export function gateDecision(visit: { pathname: string; cookie: string | undefined; token: string | null }): GateDecision {
  const { pathname, cookie, token } = visit;
  if (token === null || cookie === token) return "allow";
  if (OPEN_EXACT.has(pathname) || OPEN_PREFIXES.some((p) => pathname.startsWith(p))) return "allow";
  return DATA_PREFIXES.some((p) => pathname.startsWith(p)) ? "deny" : "coming-soon";
}

// Strips personal data from an error event before it leaves the browser or server.
// Pure, so it can be unit tested without Sentry.
import type { ErrorEvent } from "@sentry/nextjs";

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const URL_QUERY = /(https?:\/\/[^\s?#"']*)[?#][^\s"']*/g;

export function scrubText(s: string): string {
  return s.replace(URL_QUERY, "$1").replace(EMAIL, "[email]");
}

export function scrubEvent<T extends ErrorEvent>(event: T): T {
  const e = event;
  delete e.user;
  if (e.message) e.message = scrubText(e.message);
  if (e.request?.url) e.request = { url: scrubText(e.request.url) };
  else delete e.request;
  for (const v of e.exception?.values ?? []) if (v.value) v.value = scrubText(v.value);
  for (const b of e.breadcrumbs ?? []) if (b.message) b.message = scrubText(b.message);
  return e;
}

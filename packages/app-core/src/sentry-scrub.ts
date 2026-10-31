// Strips personal data from an error event before it leaves the browser or server.
// Pure, so it can be unit tested without Sentry.
// Structural subset of Sentry's ErrorEvent, so app-core needs no Sentry dependency.
interface ScrubbableEvent {
  user?: unknown;
  message?: string;
  request?: { url?: string } | undefined;
  exception?: { values?: { value?: string }[] };
  breadcrumbs?: { message?: string; data?: { [key: string]: any } }[];
}

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const URL_QUERY = /(https?:\/\/[^\s?#"']*)[?#][^\s"']*/g;

export function scrubText(s: string): string {
  return s.replace(URL_QUERY, "$1").replace(EMAIL, "[email]");
}

export function scrubEvent<T extends ScrubbableEvent>(event: T): T {
  const e = event;
  delete e.user;
  if (e.message) e.message = scrubText(e.message);
  if (e.request?.url) e.request = { url: scrubText(e.request.url) };
  else delete e.request;
  for (const v of e.exception?.values ?? []) if (v.value) v.value = scrubText(v.value);
  for (const b of e.breadcrumbs ?? []) {
    if (b.message) b.message = scrubText(b.message);
    // fetch/xhr breadcrumbs carry `url`, navigation ones `from`/`to`, often relative.
    for (const k of ["url", "from", "to"]) {
      const v = b.data?.[k];
      if (typeof v === "string") b.data![k] = scrubText(v.replace(/[?#].*$/, ""));
    }
  }
  return e;
}

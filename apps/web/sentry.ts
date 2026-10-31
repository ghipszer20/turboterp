import * as Sentry from "@sentry/nextjs";
import { scrubEvent } from "@turboterp/app-core/sentry-scrub";

// No-op unless NEXT_PUBLIC_SENTRY_DSN is set. No replay, no tracing, no PII.
export function initSentry() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    // sendDefaultPii is not an option in this SDK version; PII collection is off by default.
    tracesSampleRate: 0,
    beforeSend: (event) => scrubEvent(event),
  });
}

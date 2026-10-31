import * as Sentry from "@sentry/react-native";
import { scrubEvent } from "@turboterp/app-core/sentry-scrub";
import { config } from "./config";

/** Starts Sentry only when EXPO_PUBLIC_SENTRY_DSN is set. No tracing, no session replay, PII scrubbed. */
export function initSentry(dsn: string | null = config.sentryDsn): boolean {
  if (!dsn) return false;
  Sentry.init({
    dsn,
    tracesSampleRate: 0,
    sendDefaultPii: false,
    beforeSend: (event) => scrubEvent(event),
  });
  return true;
}

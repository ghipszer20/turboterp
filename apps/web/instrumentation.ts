import * as Sentry from "@sentry/nextjs";

export async function register() {
  const { initSentry } = await import("./sentry");
  initSentry();
}

export const onRequestError = Sentry.captureRequestError;

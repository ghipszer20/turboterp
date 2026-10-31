// The app's build-time configuration, read in one place. EXPO_PUBLIC_* values are inlined by Metro.
const DEFAULT_API_BASE_URL = "https://turboterp.com";

export interface AppConfig {
  apiBaseUrl: string;
  accessToken: string | null;
  sentryDsn: string | null;
}

function clean(v: string | undefined): string | null {
  const t = v?.trim();
  return t ? t : null;
}

export function readConfig(env: Record<string, string | undefined>): AppConfig {
  return {
    apiBaseUrl: (clean(env.EXPO_PUBLIC_API_BASE_URL) ?? DEFAULT_API_BASE_URL).replace(/\/+$/, ""),
    accessToken: clean(env.EXPO_PUBLIC_TURBOTERP_ACCESS),
    sentryDsn: clean(env.EXPO_PUBLIC_SENTRY_DSN),
  };
}

// Metro only inlines literal `process.env.EXPO_PUBLIC_X` reads, so they are listed out here.
export const config: AppConfig = readConfig({
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  EXPO_PUBLIC_TURBOTERP_ACCESS: process.env.EXPO_PUBLIC_TURBOTERP_ACCESS,
  EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
});

/** Headers every API request carries. The site-lock header is added only when configured. */
export function apiHeaders(c: AppConfig = config): Record<string, string> {
  return c.accessToken ? { "x-turboterp-access": c.accessToken } : {};
}

export function apiUrl(path: string, c: AppConfig = config): string {
  return `${c.apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

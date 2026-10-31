import { createPrivateKey, sign } from "node:crypto";

// Server-only. Sign in with Apple requires revoking the user's tokens when the account is deleted
// (App Store guideline 5.1.1(v)). The app sends a fresh authorization code; we exchange it, revoke
// the resulting token and keep nothing.

export type AppleEnv = { teamId: string; keyId: string; privateKey: string; clientId: string };

const AUDIENCE = "https://appleid.apple.com";

/** APPLE_BUNDLE_ID (the app's bundle ID) is the audience of a native sign-in code; APPLE_SERVICES_ID is the fallback. */
export function appleEnv(env: Record<string, string | undefined> = process.env): AppleEnv | null {
  const teamId = env.APPLE_TEAM_ID?.trim();
  const keyId = env.APPLE_KEY_ID?.trim();
  const privateKey = env.APPLE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
  const clientId = (env.APPLE_BUNDLE_ID || env.APPLE_SERVICES_ID)?.trim();
  return teamId && keyId && privateKey && clientId ? { teamId, keyId, privateKey, clientId } : null;
}

const b64 = (v: string | Buffer) => Buffer.from(v).toString("base64url");

/** The ES256 client secret JWT Apple's token endpoints ask for. */
export function appleClientSecret(env: AppleEnv, nowSeconds: number = Math.floor(Date.now() / 1000)): string {
  const head = b64(JSON.stringify({ alg: "ES256", kid: env.keyId, typ: "JWT" }));
  const body = b64(
    JSON.stringify({ iss: env.teamId, iat: nowSeconds, exp: nowSeconds + 300, aud: AUDIENCE, sub: env.clientId }),
  );
  const sig = sign("sha256", Buffer.from(`${head}.${body}`), { key: createPrivateKey(env.privateKey), dsaEncoding: "ieee-p1363" });
  return `${head}.${body}.${b64(sig)}`;
}

const form = (fields: Record<string, string>): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams(fields).toString(),
});

/**
 * Exchange the authorization code, then revoke the token. Resolves "skipped" (with a logged warning)
 * when the Apple key isn't configured; throws when Apple refuses. Nothing is stored.
 */
export async function revokeAppleAuthorization(
  code: string,
  env: AppleEnv | null,
  fetchFn: typeof fetch = fetch,
  warn: (msg: string) => void = console.warn,
): Promise<"revoked" | "skipped"> {
  if (!env) {
    warn("Apple revoke skipped: APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY and APPLE_SERVICES_ID are not all set.");
    return "skipped";
  }
  const secret = appleClientSecret(env);
  const tokenRes = await fetchFn(
    `${AUDIENCE}/auth/token`,
    form({ client_id: env.clientId, client_secret: secret, code, grant_type: "authorization_code" }),
  );
  if (!tokenRes.ok) throw new Error(`apple token ${tokenRes.status}`);
  const tokens = (await tokenRes.json()) as { refresh_token?: string; access_token?: string };
  const token = tokens.refresh_token ?? tokens.access_token;
  if (!token) throw new Error("apple token missing");
  const hint = tokens.refresh_token ? "refresh_token" : "access_token";
  const revokeRes = await fetchFn(
    `${AUDIENCE}/auth/revoke`,
    form({ client_id: env.clientId, client_secret: secret, token, token_type_hint: hint }),
  );
  if (!revokeRes.ok) throw new Error(`apple revoke ${revokeRes.status}`);
  return "revoked";
}

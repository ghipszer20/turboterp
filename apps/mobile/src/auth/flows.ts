// The sign-in and delete flows, written against small injected pieces so they can be unit tested.
// Native modules (expo-web-browser, expo-apple-authentication) are wired in sign-in-native.ts.
import { sendProblem, verifyProblem } from "@turboterp/app-core/auth/email";

export const REDIRECT_URL = "turboterp://auth/callback";

/** The slice of the Supabase client these flows use. */
export interface AuthApi {
  auth: {
    signInWithOtp(a: { email: string; options?: { shouldCreateUser?: boolean } }): Promise<{ error: unknown }>;
    verifyOtp(a: { email: string; token: string; type: "email" }): Promise<{ error: unknown }>;
    signInWithOAuth(a: {
      provider: "google";
      options: { redirectTo: string; skipBrowserRedirect: boolean };
    }): Promise<{ data: { url: string | null }; error: unknown }>;
    exchangeCodeForSession(code: string): Promise<{ error: unknown }>;
    signInWithIdToken(a: { provider: "apple"; token: string; nonce?: string }): Promise<{ error: unknown }>;
    getSession(): Promise<{ data: { session: { access_token: string } | null } }>;
    signOut(): Promise<{ error: unknown }>;
  };
}

export type FlowResult = { ok: true } | { ok: false; message: string | null };
const done: FlowResult = { ok: true };
const fail = (message: string | null): FlowResult => ({ ok: false, message });

export const CANCELLED_APPLE = "Sign in with Apple was cancelled. You can try again, or keep using TurboTerp without an account.";
export const CANCELLED_GOOGLE = "Google sign-in was cancelled. You can try again, or keep using TurboTerp without an account.";

export function appleProblem(error: unknown): string {
  const code = (error as { code?: string } | null)?.code;
  if (code === "ERR_REQUEST_CANCELED" || code === "ERR_CANCELED") return CANCELLED_APPLE;
  return "Sign in with Apple didn't work. Try again in a moment.";
}

export function googleProblem(): string {
  return "Google sign-in didn't work. Try again in a moment.";
}

export async function sendEmailCode(client: AuthApi, email: string): Promise<FlowResult> {
  try {
    const { error } = await client.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
    return error ? fail(sendProblem(error)) : done;
  } catch (thrown) {
    return fail(sendProblem(thrown));
  }
}

export async function verifyEmailCode(client: AuthApi, email: string, token: string): Promise<FlowResult> {
  try {
    const { error } = await client.auth.verifyOtp({ email: email.trim(), token, type: "email" });
    return error ? fail(verifyProblem(error)) : done;
  } catch (thrown) {
    return fail(verifyProblem(thrown));
  }
}

export type BrowserResult = { type: "success"; url: string } | { type: "cancel" | "dismiss" | "locked" | "opened" };

/** The `code` query parameter of the callback URL (parsed by hand; RN's URL class is partial). */
export function codeFromCallback(url: string): string | null {
  const m = /[?&#]code=([^&#]+)/.exec(url);
  return m ? decodeURIComponent(m[1]) : null;
}

export async function signInWithGoogle(
  client: AuthApi,
  openAuthSession: (url: string, redirect: string) => Promise<BrowserResult>,
): Promise<FlowResult> {
  try {
    const { data, error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: REDIRECT_URL, skipBrowserRedirect: true },
    });
    if (error || !data.url) return fail(googleProblem());
    const result = await openAuthSession(data.url, REDIRECT_URL);
    if (result.type !== "success") return fail(CANCELLED_GOOGLE);
    const code = codeFromCallback(result.url);
    if (!code) return fail(googleProblem());
    const { error: exchangeError } = await client.auth.exchangeCodeForSession(code);
    return exchangeError ? fail(googleProblem()) : done;
  } catch {
    return fail(googleProblem());
  }
}

export interface AppleCredential {
  identityToken: string | null;
  authorizationCode: string | null;
}

/** `nonce` is the raw value; Apple was given its SHA-256 hash. */
export async function signInWithApple(
  client: AuthApi,
  requestApple: () => Promise<{ credential: AppleCredential; nonce: string }>,
): Promise<FlowResult> {
  try {
    const { credential, nonce } = await requestApple();
    if (!credential.identityToken) return fail(appleProblem(null));
    const { error } = await client.auth.signInWithIdToken({ provider: "apple", token: credential.identityToken, nonce });
    return error ? fail(appleProblem(error)) : done;
  } catch (thrown) {
    return fail(appleProblem(thrown));
  }
}

export const DELETE_QUESTION = "Are you sure you want to delete your account?";
export const DELETE_DETAIL =
  "This permanently deletes your TurboTerp account, your synced Advisor plan and your synced schedule from our servers. Copies on this phone stay.";

export interface DeleteDeps {
  client: AuthApi;
  /** True when the signed-in account uses Sign in with Apple. */
  isAppleAccount: boolean;
  /** Asks Sign in with Apple again; resolves the fresh authorization code, or null if cancelled. */
  reauthApple: () => Promise<string | null>;
  fetchFn: typeof fetch;
  deleteUrl: string;
  headers: Record<string, string>;
}

/** Calls POST /api/account/delete; for an Apple account it first gets a fresh Apple authorization code. Signs out on success. */
export async function deleteAccount(d: DeleteDeps): Promise<FlowResult> {
  let appleAuthorizationCode: string | undefined;
  if (d.isAppleAccount) {
    let code: string | null;
    try {
      code = await d.reauthApple();
    } catch {
      code = null;
    }
    if (!code) return fail("We need you to confirm with Apple before deleting the account. Your account was not deleted.");
    appleAuthorizationCode = code;
  }
  try {
    const { data } = await d.client.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return fail("You are signed out. Sign in again to delete your account.");
    const res = await d.fetchFn(d.deleteUrl, {
      method: "POST",
      headers: { ...d.headers, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(appleAuthorizationCode ? { appleAuthorizationCode } : {}),
    });
    if (!res.ok) {
      return fail(
        res.status === 502
          ? "Apple didn't confirm the request, so nothing was deleted. Try again."
          : "We couldn't delete the account right now. Nothing was deleted. Try again in a moment.",
      );
    }
    await d.client.auth.signOut().catch(() => undefined);
    return done;
  } catch {
    return fail("We couldn't reach TurboTerp. Nothing was deleted. Check your connection and try again.");
  }
}

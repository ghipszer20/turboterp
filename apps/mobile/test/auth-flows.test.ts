import { describe, expect, it, vi } from "vitest";
import { normalizeCode } from "@turboterp/app-core/auth/email";
import {
  CANCELLED_APPLE,
  CANCELLED_GOOGLE,
  REDIRECT_URL,
  codeFromCallback,
  deleteAccount,
  sendEmailCode,
  signInWithApple,
  signInWithGoogle,
  verifyEmailCode,
  type AuthApi,
} from "../src/auth/flows";

const ok = { error: null };
function api(over: Partial<AuthApi["auth"]> = {}): AuthApi {
  return {
    auth: {
      signInWithOtp: vi.fn(async () => ok),
      verifyOtp: vi.fn(async () => ok),
      signInWithOAuth: vi.fn(async () => ({ data: { url: "https://x/auth" }, error: null })),
      exchangeCodeForSession: vi.fn(async () => ok),
      signInWithIdToken: vi.fn(async () => ok),
      getSession: vi.fn(async () => ({ data: { session: { access_token: "tok" } } })),
      signOut: vi.fn(async () => ok),
      ...over,
    },
  };
}

describe("email code", () => {
  it("normalizes pasted codes", () => expect(normalizeCode("123 456-78")).toBe("12345678"));
  it("explains an email limit", async () => {
    const c = api({ signInWithOtp: async () => ({ error: { status: 429 } }) });
    const r = await sendEmailCode(c, "a@b.co");
    expect(r).toMatchObject({ ok: false });
    expect((r as { message: string }).message).toMatch(/Too many sign-in emails/);
  });
  it("explains a refused or expired code", async () => {
    const c = api({ verifyOtp: async () => ({ error: { code: "otp_expired" } }) });
    expect((await verifyEmailCode(c, "a@b.co", "123456")) as { message: string }).toMatchObject({ ok: false, message: expect.stringMatching(/didn't work/) });
  });
  it("succeeds", async () => expect(await verifyEmailCode(api(), "a@b.co", "123456")).toEqual({ ok: true }));
});

describe("google", () => {
  it("opens the PKCE url and exchanges the callback code", async () => {
    const c = api();
    const open = vi.fn(async () => ({ type: "success" as const, url: `${REDIRECT_URL}?code=abc%2B1` }));
    expect(await signInWithGoogle(c, open)).toEqual({ ok: true });
    expect(open).toHaveBeenCalledWith("https://x/auth", REDIRECT_URL);
    expect(c.auth.exchangeCodeForSession).toHaveBeenCalledWith("abc+1");
  });
  it("says so when the sheet is cancelled", async () => {
    const r = await signInWithGoogle(api(), async () => ({ type: "cancel" }));
    expect(r).toEqual({ ok: false, message: CANCELLED_GOOGLE });
  });
  it("reads the code from a fragment or query", () => {
    expect(codeFromCallback("turboterp://auth/callback#code=z")).toBe("z");
    expect(codeFromCallback("turboterp://auth/callback")).toBeNull();
  });
});

describe("apple", () => {
  it("passes the identity token and raw nonce to Supabase", async () => {
    const c = api();
    const r = await signInWithApple(c, async () => ({ credential: { identityToken: "idt", authorizationCode: "ac" }, nonce: "n1" }));
    expect(r).toEqual({ ok: true });
    expect(c.auth.signInWithIdToken).toHaveBeenCalledWith({ provider: "apple", token: "idt", nonce: "n1" });
  });
  it("explains a cancelled sheet", async () => {
    const r = await signInWithApple(api(), async () => {
      throw Object.assign(new Error("x"), { code: "ERR_REQUEST_CANCELED" });
    });
    expect(r).toEqual({ ok: false, message: CANCELLED_APPLE });
  });
});

describe("deleteAccount", () => {
  const base = (c: AuthApi, fetchFn: unknown, over = {}) => ({
    client: c,
    isAppleAccount: false,
    reauthApple: async () => "fresh",
    fetchFn: fetchFn as typeof fetch,
    deleteUrl: "https://t/api/account/delete",
    headers: {},
    ...over,
  });
  it("posts with the bearer token and signs out", async () => {
    const c = api();
    const f = vi.fn(async () => new Response("{}", { status: 200 }));
    expect(await deleteAccount(base(c, f))).toEqual({ ok: true });
    const init = (f.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer tok");
    expect(init.body).toBe("{}");
    expect(c.auth.signOut).toHaveBeenCalled();
  });
  it("sends the fresh Apple code for an Apple account", async () => {
    const f = vi.fn(async () => new Response("{}", { status: 200 }));
    await deleteAccount(base(api(), f, { isAppleAccount: true }));
    expect((f.mock.calls[0] as unknown as [string, RequestInit])[1].body).toBe(JSON.stringify({ appleAuthorizationCode: "fresh" }));
  });
  it("does nothing when the Apple re-check is cancelled", async () => {
    const f = vi.fn();
    const r = await deleteAccount(base(api(), f, { isAppleAccount: true, reauthApple: async () => null }));
    expect(r).toMatchObject({ ok: false });
    expect(f).not.toHaveBeenCalled();
  });
  it("keeps the session when the server refuses", async () => {
    const c = api();
    const r = await deleteAccount(base(c, async () => new Response("{}", { status: 502 }), { isAppleAccount: true }));
    expect(r).toMatchObject({ ok: false });
    expect(c.auth.signOut).not.toHaveBeenCalled();
  });
});

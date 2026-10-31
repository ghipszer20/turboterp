import { generateKeyPairSync } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { appleClientSecret, appleEnv, revokeAppleAuthorization } from "../account/apple-revoke";

const { privateKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
const env = { teamId: "TEAM", keyId: "KEY", privateKey: pem, clientId: "com.turboterp.app" };
const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });

describe("apple revoke", () => {
  it("appleEnv is null unless everything is set", () => {
    expect(appleEnv({ APPLE_TEAM_ID: "t" })).toBeNull();
    expect(appleEnv({ APPLE_TEAM_ID: "t", APPLE_KEY_ID: "k", APPLE_PRIVATE_KEY: "p", APPLE_SERVICES_ID: "s" })?.clientId).toBe("s");
  });
  it("builds an ES256 client secret", () => {
    const [h, b, s] = appleClientSecret(env, 1000).split(".");
    expect(JSON.parse(Buffer.from(h, "base64url").toString())).toMatchObject({ alg: "ES256", kid: "KEY" });
    expect(JSON.parse(Buffer.from(b, "base64url").toString())).toMatchObject({
      iss: "TEAM",
      sub: "com.turboterp.app",
      aud: "https://appleid.apple.com",
      exp: 1300,
    });
    expect(Buffer.from(s, "base64url")).toHaveLength(64);
  });
  it("exchanges the code, then revokes the refresh token", async () => {
    const f = vi.fn().mockResolvedValueOnce(ok({ refresh_token: "r1" })).mockResolvedValueOnce(ok({}));
    expect(await revokeAppleAuthorization("code1", env, f as unknown as typeof fetch)).toBe("revoked");
    expect(f.mock.calls[0][0]).toBe("https://appleid.apple.com/auth/token");
    expect(String(f.mock.calls[0][1].body)).toContain("code=code1");
    expect(f.mock.calls[1][0]).toBe("https://appleid.apple.com/auth/revoke");
    expect(String(f.mock.calls[1][1].body)).toContain("token=r1");
  });
  it("skips with a warning when unconfigured", async () => {
    const f = vi.fn();
    const warn = vi.fn();
    expect(await revokeAppleAuthorization("c", null, f as unknown as typeof fetch, warn)).toBe("skipped");
    expect(f).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalled();
  });
  it("throws when Apple refuses", async () => {
    const f = vi.fn().mockResolvedValue(new Response("{}", { status: 400 }));
    await expect(revokeAppleAuthorization("c", env, f as unknown as typeof fetch)).rejects.toThrow();
  });
});

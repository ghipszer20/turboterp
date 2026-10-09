import { describe, expect, it, vi } from "vitest";
import { handleAccountDelete, supabaseDeleteUser, type AccountDeleteDeps } from "../account/delete";

const req = (auth?: string) => new Request("http://x/api/account/delete", { method: "POST", headers: auth ? { authorization: auth } : {} });
const deps = (over: Partial<AccountDeleteDeps> = {}): AccountDeleteDeps => ({
  getUser: async () => ({ id: "u-1", email: "a@b.c" }),
  deleteUser: vi.fn(async () => {}),
  ...over,
});

describe("handleAccountDelete", () => {
  it("401 without a token", async () => {
    const d = deps();
    const res = await handleAccountDelete(req(), d);
    expect(res.status).toBe(401);
    expect(d.deleteUser).not.toHaveBeenCalled();
  });
  it("401 with a bad token", async () => {
    const d = deps({ getUser: async () => null });
    const res = await handleAccountDelete(req("Bearer nope"), d);
    expect(res.status).toBe(401);
    expect(d.deleteUser).not.toHaveBeenCalled();
  });
  it("deletes exactly the token's user and returns ok", async () => {
    const d = deps();
    const res = await handleAccountDelete(req("Bearer good"), d);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(d.deleteUser).toHaveBeenCalledTimes(1);
    expect(d.deleteUser).toHaveBeenCalledWith("u-1");
  });
  it("503 when the admin delete fails", async () => {
    const d = deps({
      deleteUser: async () => {
        throw new Error("boom");
      },
    });
    expect((await handleAccountDelete(req("Bearer good"), d)).status).toBe(503);
  });
  it("503 when the user lookup is unavailable", async () => {
    const d = deps({
      getUser: async () => {
        throw new Error("down");
      },
    });
    expect((await handleAccountDelete(req("Bearer good"), d)).status).toBe(503);
  });
});

describe("supabaseDeleteUser", () => {
  const env = { url: "https://p.supabase.co", serviceKey: "svc" };
  it("sends a service-role DELETE to the admin users endpoint", async () => {
    const f = vi.fn(async () => new Response("{}", { status: 200 }));
    await supabaseDeleteUser(env, f as unknown as typeof fetch)("u-1");
    expect(f).toHaveBeenCalledWith("https://p.supabase.co/auth/v1/admin/users/u-1", {
      method: "DELETE",
      headers: { apikey: "svc", Authorization: "Bearer svc" },
    });
  });
  it("throws on a non-ok response", async () => {
    const f = vi.fn(async () => new Response("{}", { status: 500 }));
    await expect(supabaseDeleteUser(env, f as unknown as typeof fetch)("u-1")).rejects.toThrow();
  });
});

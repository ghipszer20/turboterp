import { describe, expect, it, vi } from "vitest";
import { CONSENT_VERSION } from "../../advisor/consent";
import type { SendStore } from "../../email/rate-limit";
import { handleConsentRecord, nameHash, type ConsentDeps, type ConsentRow } from "../record";

const NOW = new Date("2026-10-08T12:00:00Z");
const DEVICE = "3f2b8c1e-5d4a-4e6f-9a1b-2c3d4e5f6a7b";
const good = () => ({ name: "Ada Lovelace", version: CONSENT_VERSION, acceptedAt: "2026-10-08T11:59:00Z", deviceId: DEVICE });
const req = (body: unknown, auth: string | null = null) =>
  new Request("http://x/api/consent", {
    method: "POST",
    headers: { "content-type": "application/json", ...(auth ? { authorization: auth } : {}) },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

function deps(over: Partial<ConsentDeps> = {}) {
  const store = {
    link: vi.fn(async (_d: string, _v: string, _u: string) => false),
    insert: vi.fn(async (_row: ConsentRow) => {}),
  };
  const limits: SendStore = { count: async () => 0, record: vi.fn(async () => {}) };
  const getUser = vi.fn(async (t: string) => (t === "tok" ? { id: "u1", email: "a@b.test" } : null));
  return { getUser, store, limits, secret: "s3cret", now: () => NOW, ...over } as unknown as ConsentDeps & {
    store: typeof store;
    getUser: typeof getUser;
  };
}

describe("nameHash", () => {
  it("is a keyed hash of the normalised name", () => {
    expect(nameHash("  Ada   LOVELACE ", "k")).toBe(nameHash("ada lovelace", "k"));
    expect(nameHash("ada lovelace", "k")).not.toBe(nameHash("ada lovelace", "k2"));
    expect(nameHash("ada lovelace", "k")).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("handleConsentRecord", () => {
  it("rejects invalid input with 400", async () => {
    const bads = [
      "not json",
      null,
      { ...good(), version: "1999-01-01" },
      { ...good(), name: "A" },
      { ...good(), deviceId: "nope" },
      { ...good(), acceptedAt: "2026-10-10T12:00:00Z" },
      { ...good(), acceptedAt: "garbage" },
    ];
    for (const b of bads) expect((await handleConsentRecord(req(b), deps())).status).toBe(400);
  });
  it("stores the hash, never the raw name", async () => {
    const d = deps();
    const res = await handleConsentRecord(req(good()), d);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    const row = d.store.insert.mock.calls[0]![0];
    expect(JSON.stringify(row)).not.toContain("Lovelace");
    expect(row.nameHash).toBe(nameHash("Ada Lovelace", "s3cret"));
  });
  it("signed out inserts with a null user", async () => {
    const d = deps();
    await handleConsentRecord(req(good()), d);
    expect(d.store.insert.mock.calls[0]![0]).toMatchObject({ userId: null, deviceId: DEVICE, version: CONSENT_VERSION });
  });
  it("signed in with nothing to link inserts with the user id", async () => {
    const d = deps();
    await handleConsentRecord(req(good(), "Bearer tok"), d);
    expect(d.store.link).toHaveBeenCalledWith(DEVICE, CONSENT_VERSION, "u1");
    expect(d.store.insert.mock.calls[0]![0]).toMatchObject({ userId: "u1" });
  });
  it("signed in with an unlinked row links it and does not insert", async () => {
    const d = deps();
    d.store.link.mockResolvedValue(true);
    const res = await handleConsentRecord(req(good(), "Bearer tok"), d);
    expect(res.status).toBe(200);
    expect(d.store.insert).not.toHaveBeenCalled();
  });
  it("a bad token is treated as signed out", async () => {
    const d = deps();
    await handleConsentRecord(req(good(), "Bearer wrong"), d);
    expect(d.store.insert.mock.calls[0]![0]).toMatchObject({ userId: null });
  });
  it("returns 429 when limited", async () => {
    const d = deps({ limits: { count: async () => 10, record: async () => {} } });
    expect((await handleConsentRecord(req(good()), d)).status).toBe(429);
    expect(d.store.insert).not.toHaveBeenCalled();
  });
  it("returns 503 when the limiter store throws", async () => {
    const d = deps({
      limits: {
        count: async () => {
          throw new Error("x");
        },
        record: async () => {},
      },
    });
    expect((await handleConsentRecord(req(good()), d)).status).toBe(503);
  });
  it("returns 503 when the record store throws", async () => {
    const d = deps();
    d.store.insert.mockRejectedValue(new Error("down"));
    expect((await handleConsentRecord(req(good()), d)).status).toBe(503);
  });
  it("returns 503 when not configured", async () => {
    expect((await handleConsentRecord(req(good()), deps({ secret: "" }))).status).toBe(503);
  });
});

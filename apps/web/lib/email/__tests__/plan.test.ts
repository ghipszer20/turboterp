import { describe, expect, it, vi } from "vitest";
import { handlePlanEmail, validatePlanEmail, type PlanEmailDeps } from "../plan";
import { hashKey, type SendStore } from "../rate-limit";
import { FOOTER } from "../../advisor/export/plan-export";

const pdf = (extra = "") => Buffer.from("%PDF-1.4 hello" + extra).toString("base64");
const req = (body: unknown, auth: string | null = "Bearer tok") =>
  new Request("http://x/api/email/plan", {
    method: "POST",
    headers: { "content-type": "application/json", ...(auth ? { authorization: auth } : {}) },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
const good = () => ({ pdfBase64: pdf(), summary: ["Credits earned: 12", "Credits planned: 120"] });

function deps(over: Partial<PlanEmailDeps> = {}) {
  const send = vi.fn(async () => ({ ok: true as const }));
  const getUser = vi.fn(async (t: string) => (t === "tok" ? { id: "u1", email: "me@umd.test" } : null));
  const store: SendStore = { count: async () => 0, record: vi.fn(async () => {}) };
  return { send, getUser, store, now: () => new Date("2026-10-06T12:00:00Z"), ...over } as unknown as PlanEmailDeps & {
    send: ReturnType<typeof vi.fn>;
    getUser: ReturnType<typeof vi.fn>;
  };
}

describe("validatePlanEmail", () => {
  it("accepts a good body", () => {
    expect(validatePlanEmail(good()).ok).toBe(true);
  });
  it("rejects bad shapes and limits", () => {
    const big = Buffer.alloc(2 * 1024 * 1024 + 1, 1);
    big.write("%PDF-");
    const bads = [
      null,
      "x",
      {},
      { ...good(), pdfBase64: Buffer.from("not a pdf").toString("base64") },
      { ...good(), pdfBase64: big.toString("base64") },
      { ...good(), summary: Array(41).fill("a") },
      { ...good(), summary: ["a".repeat(201)] },
      { ...good(), summary: ["a", 5] },
      { ...good(), summary: "a" },
    ];
    for (const b of bads) expect(validatePlanEmail(b).ok).toBe(false);
  });
  it("accepts the limits", () => {
    expect(validatePlanEmail({ ...good(), summary: Array(40).fill("a".repeat(200)) }).ok).toBe(true);
  });
});

describe("handlePlanEmail", () => {
  it("401 without a token or with a bad token, and sends nothing", async () => {
    const d = deps();
    expect((await handlePlanEmail(req(good(), null), d)).status).toBe(401);
    expect((await handlePlanEmail(req(good(), "Bearer nope"), d)).status).toBe(401);
    expect(d.send).not.toHaveBeenCalled();
  });
  it("sends only to the user's own email, ignoring a body address", async () => {
    const d = deps();
    const res = await handlePlanEmail(req({ ...good(), to: "evil@x.test", email: "evil@x.test" }), d);
    expect(res.status).toBe(200);
    const msg = d.send.mock.calls[0][0];
    expect(msg.to).toBe("me@umd.test");
    expect(msg.subject).toBe("Your TurboTerp 4-year plan");
    expect(msg.attachment).toEqual({ name: "turboterp-plan.pdf", base64: pdf() });
    expect(msg.text).toBe(["Credits earned: 12", "Credits planned: 120", "", FOOTER].join("\n"));
    expect(await res.json()).toEqual({ ok: true, email: "me@umd.test" });
  });
  it("400 on invalid body", async () => {
    expect((await handlePlanEmail(req({ ...good(), summary: ["a".repeat(201)] }), deps())).status).toBe(400);
    expect((await handlePlanEmail(req("{bad"), deps())).status).toBe(400);
  });
  it("429 when rate limited, keyed by hashed user id", async () => {
    const count = vi.fn(async () => 5);
    const d = deps({ store: { count, record: async () => {} } });
    expect((await handlePlanEmail(req(good()), d)).status).toBe(429);
    expect(JSON.stringify(count.mock.calls)).toContain(hashKey("u1"));
    expect(d.send).not.toHaveBeenCalled();
  });
  it("503 fail closed on store error or missing store", async () => {
    const bad = deps({
      store: {
        count: async () => {
          throw new Error("x");
        },
        record: async () => {},
      },
    });
    expect((await handlePlanEmail(req(good()), bad)).status).toBe(503);
    expect((await handlePlanEmail(req(good()), deps({ store: null }))).status).toBe(503);
    expect(bad.send).not.toHaveBeenCalled();
  });
  it("503 not-configured and 502 on rejection", async () => {
    const nc = deps({ send: vi.fn(async () => ({ ok: false as const, reason: "not-configured" as const })) });
    const r = await handlePlanEmail(req(good()), nc);
    expect(r.status).toBe(503);
    expect(await r.json()).toEqual({ error: "not-configured" });
    const rj = deps({ send: vi.fn(async () => ({ ok: false as const, reason: "rejected" as const })) });
    expect((await handlePlanEmail(req(good()), rj)).status).toBe(502);
  });
});

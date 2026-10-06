import { describe, expect, it, vi } from "vitest";
import { sendEmail, type EmailSettings } from "../send";

const SETTINGS: EmailSettings = { apiKey: "k-test", from: "noreply@example.test" };
const MSG = { to: "owner@example.test", subject: "Hi", text: "Body" };

describe("sendEmail", () => {
  it("is not-configured, and never calls fetch, when a setting is missing", async () => {
    const fetchFn = vi.fn();
    for (const settings of [{ ...SETTINGS, apiKey: "" }, { ...SETTINGS, from: "" }]) {
      expect(await sendEmail(MSG, { fetch: fetchFn as never, settings })).toEqual({ ok: false, reason: "not-configured" });
    }
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("posts the Brevo request with the api-key header", async () => {
    const fetchFn = vi.fn(async () => new Response("{}", { status: 201 }));
    const r = await sendEmail({ ...MSG, replyTo: "me@example.test", attachment: { name: "a.pdf", base64: "QUJD" } }, {
      fetch: fetchFn as never,
      settings: SETTINGS,
    });
    expect(r).toEqual({ ok: true });
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.brevo.com/v3/smtp/email");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["api-key"]).toBe("k-test");
    expect(JSON.parse(init.body as string)).toEqual({
      sender: { name: "TurboTerp", email: "noreply@example.test" },
      to: [{ email: "owner@example.test" }],
      subject: "Hi",
      textContent: "Body",
      replyTo: { email: "me@example.test" },
      attachment: [{ name: "a.pdf", content: "QUJD" }],
    });
  });

  it("omits replyTo and attachment when not given", async () => {
    const fetchFn = vi.fn(async () => new Response("{}", { status: 201 }));
    await sendEmail(MSG, { fetch: fetchFn as never, settings: SETTINGS });
    const body = JSON.parse((fetchFn.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(body).not.toHaveProperty("replyTo");
    expect(body).not.toHaveProperty("attachment");
  });

  it("reports rejected on a non-2xx answer and network when fetch throws", async () => {
    const rejected = await sendEmail(MSG, { fetch: (async () => new Response("no", { status: 401 })) as never, settings: SETTINGS });
    expect(rejected).toEqual({ ok: false, reason: "rejected" });
    const network = await sendEmail(MSG, {
      fetch: (async () => {
        throw new Error("down");
      }) as never,
      settings: SETTINGS,
    });
    expect(network).toEqual({ ok: false, reason: "network" });
  });
});

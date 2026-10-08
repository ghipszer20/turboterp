import { describe, expect, it, vi } from "vitest";
import { buildConsentDigest, previousUtcDay, runDailyDigest, type DigestRow, type Usage } from "../digest";

const usage = (over: Partial<Usage> = {}): Usage => ({ db_bytes: 50e6, documents: 3, consents: 5, accounts: 2, ...over });
const row = (over: Partial<DigestRow> = {}): DigestRow => ({
  recorded_at: "2026-10-07T10:00:00Z",
  accepted_at: "2026-10-07T09:59:00Z",
  version: "2026-09-26",
  user_id: "u1",
  device_id: "d1",
  name_hash: "abc",
  ...over,
});

describe("previousUtcDay", () => {
  it("covers the previous UTC day", () => {
    expect(previousUtcDay(new Date("2026-10-08T03:00:00Z"))).toEqual({
      day: "2026-10-07",
      from: "2026-10-07T00:00:00.000Z",
      to: "2026-10-08T00:00:00.000Z",
    });
  });
});

describe("buildConsentDigest", () => {
  it("builds a csv with the exact header and one line per row", () => {
    const d = buildConsentDigest([row(), row({ user_id: null })], usage(), "2026-10-07");
    const lines = d.csv.trimEnd().split("\n");
    expect(lines[0]).toBe("recorded_at,accepted_at,version,account_id,device_id,name_hash");
    expect(lines).toHaveLength(3);
    expect(lines[1]).toBe("2026-10-07T10:00:00Z,2026-10-07T09:59:00Z,2026-09-26,u1,d1,abc");
    expect(lines[2]).toContain(",2026-09-26,,d1,");
    expect(d.subject).toContain("2026-10-07");
    expect(d.text).toContain("2 new agreements");
  });
  it("escapes quotes and commas", () => {
    const d = buildConsentDigest([row({ version: 'a,"b"' })], usage(), "2026-10-07");
    expect(d.csv).toContain('"a,""b"""');
  });
  it("says so when there are no records", () => {
    const d = buildConsentDigest([], usage(), "2026-10-07");
    expect(d.text).toContain("No new agreements");
    expect(d.csv.trim()).toBe("recorded_at,accepted_at,version,account_id,device_id,name_hash");
  });
  it("warns in the subject at 70% of 500 MB", () => {
    expect(buildConsentDigest([], usage({ db_bytes: 350e6 }), "d").subject).toContain("WARNING");
    expect(buildConsentDigest([], usage({ db_bytes: 349e6 }), "d").subject).not.toContain("WARNING");
  });
});

describe("runDailyDigest", () => {
  const deps = (over = {}) => ({
    recordsEmail: "owner@x.test",
    fetchRows: vi.fn(async () => [row()]),
    fetchUsage: vi.fn(async () => usage()),
    send: vi.fn(async () => ({ ok: true as const })),
    now: () => new Date("2026-10-08T03:00:00Z"),
    ...over,
  });
  it("sends the digest with the csv attached", async () => {
    const d = deps();
    expect(await runDailyDigest(d)).toBe("sent");
    const msg = d.send.mock.calls[0]![0] as { to: string; attachment: { name: string; base64: string } };
    expect(msg.to).toBe("owner@x.test");
    expect(msg.attachment.name).toBe("agreements-2026-10-07.csv");
    expect(Buffer.from(msg.attachment.base64, "base64").toString()).toContain("recorded_at,");
    expect(d.fetchRows).toHaveBeenCalledWith("2026-10-07T00:00:00.000Z", "2026-10-08T00:00:00.000Z");
  });
  it("skips quietly when RECORDS_EMAIL is unset", async () => {
    const d = deps({ recordsEmail: undefined });
    expect(await runDailyDigest(d)).toBe("skipped");
    expect(d.send).not.toHaveBeenCalled();
  });
  it("never throws when something fails", async () => {
    expect(await runDailyDigest(deps({ fetchRows: async () => { throw new Error("db"); } }))).toBe("failed");
    expect(await runDailyDigest(deps({ send: async () => ({ ok: false as const, reason: "rejected" as const }) }))).toBe("failed");
  });
});

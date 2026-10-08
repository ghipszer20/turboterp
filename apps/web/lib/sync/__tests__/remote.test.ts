import { describe, expect, it } from "vitest";
import { createRemote } from "../remote";

type Result = { data?: unknown; error?: { code?: string; message?: string; status?: number } | null };

/** A fake Supabase client: every query builder method records itself and returns the builder; awaiting yields `result`. */
function fakeClient(result: Result | (() => never), session: { user: { id: string } } | null = { user: { id: "u1" } }) {
  const calls: Array<[string, unknown[]]> = [];
  const builder: Record<string, unknown> = {
    then(resolve: (v: Result) => void, reject: (e: unknown) => void) {
      try {
        resolve(typeof result === "function" ? result() : { error: null, ...result });
      } catch (e) {
        reject(e);
      }
    },
  };
  for (const m of ["select", "insert", "update", "eq", "maybeSingle"]) {
    builder[m] = (...args: unknown[]) => {
      calls.push([m, args]);
      return builder;
    };
  }
  const client = {
    from: (t: string) => {
      calls.push(["from", [t]]);
      return builder;
    },
    auth: { getSession: async () => ({ data: { session } }) },
  };
  return { remote: createRemote(async () => client as never), calls };
}

describe("remote", () => {
  it("fetchRevs selects only kind and rev", async () => {
    const { remote, calls } = fakeClient({ data: [{ kind: "plan", rev: 3 }] });
    expect(await remote.fetchRevs()).toEqual([{ kind: "plan", rev: 3 }]);
    expect(calls).toContainEqual(["select", ["kind,rev"]]);
  });

  it("fetchDoc returns body and rev, or null when absent", async () => {
    expect(await fakeClient({ data: { body: { a: 1 }, rev: 2 } }).remote.fetchDoc("plan")).toEqual({
      body: { a: 1 },
      rev: 2,
    });
    expect(await fakeClient({ data: null }).remote.fetchDoc("plan")).toBeNull();
  });

  it("insert when expectedRev is null, selecting rev", async () => {
    const { remote, calls } = fakeClient({ data: [{ rev: 1 }] });
    expect(await remote.saveDoc("plan", { a: 1 }, null)).toEqual({ ok: true, rev: 1 });
    expect(calls).toContainEqual(["insert", [{ user_id: "u1", kind: "plan", body: { a: 1 } }]]);
    expect(calls).toContainEqual(["select", ["rev"]]);
  });

  it("update filtered by expected rev; the client never sends rev in the body", async () => {
    const { remote, calls } = fakeClient({ data: [{ rev: 5 }] });
    expect(await remote.saveDoc("schedule", { a: 1 }, 4)).toEqual({ ok: true, rev: 5 });
    expect(calls).toContainEqual(["update", [{ body: { a: 1 } }]]);
    expect(calls).toContainEqual(["eq", ["rev", 4]]);
    expect(calls).toContainEqual(["eq", ["kind", "schedule"]]);
  });

  it("an update that touches 0 rows is a conflict", async () => {
    expect(await fakeClient({ data: [] }).remote.saveDoc("plan", {}, 4)).toEqual({ ok: false, reason: "conflict" });
  });

  it("maps errors", async () => {
    const r = (error: Result["error"]) => fakeClient({ data: null, error }).remote.saveDoc("plan", {}, null);
    expect(await r({ code: "23505" })).toEqual({ ok: false, reason: "conflict" });
    expect(await r({ code: "23514" })).toEqual({ ok: false, reason: "too-large" });
    expect(await r({ code: "42501" })).toEqual({ ok: false, reason: "auth" });
    expect(await r({ status: 401 })).toEqual({ ok: false, reason: "auth" });
    expect(await r({ code: "XX000" })).toEqual({ ok: false, reason: "error" });
  });

  it("a network failure is offline", async () => {
    const { remote } = fakeClient(() => {
      throw new TypeError("Failed to fetch");
    });
    expect(await remote.saveDoc("plan", {}, null)).toEqual({ ok: false, reason: "offline" });
  });

  it("no session is auth", async () => {
    expect(await fakeClient({ data: [{ rev: 1 }] }, null).remote.saveDoc("plan", {}, null)).toEqual({
      ok: false,
      reason: "auth",
    });
  });
});

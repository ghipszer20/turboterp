// Supabase calls for account sync. The client comes in as a factory so tests can fake it.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { DocKind } from "./decide";

export type { DocKind };
export type RemoteRev = { kind: DocKind; rev: number };
export type SaveResult =
  | { ok: true; rev: number }
  | { ok: false; reason: "conflict" | "too-large" | "offline" | "auth" | "error" };

export type Remote = {
  fetchRevs(): Promise<RemoteRev[]>;
  fetchDoc(kind: DocKind): Promise<{ body: unknown; rev: number } | null>;
  saveDoc(kind: DocKind, body: unknown, expectedRev: number | null): Promise<SaveResult>;
};

const TABLE = "user_documents";

type PgError = { code?: string; message?: string; status?: number } | null | undefined;

function failReason(error: PgError): Extract<SaveResult, { ok: false }>["reason"] {
  if (error?.code === "23505") return "conflict";
  if (error?.code === "23514") return "too-large";
  if (error?.code === "42501" || error?.code === "PGRST301" || error?.status === 401 || error?.status === 403)
    return "auth";
  if (/failed to fetch|network/i.test(error?.message ?? "")) return "offline";
  return "error";
}

function isNetworkFailure(e: unknown): boolean {
  return e instanceof TypeError || (typeof navigator !== "undefined" && navigator.onLine === false);
}

export function createRemote(getClient: () => Promise<SupabaseClient>): Remote {
  return {
    async fetchRevs() {
      const client = await getClient();
      const { data, error } = await client.from(TABLE).select("kind,rev");
      if (error) throw new Error(error.message);
      return (data ?? []) as RemoteRev[];
    },

    async fetchDoc(kind) {
      const client = await getClient();
      const { data, error } = await client.from(TABLE).select("body,rev").eq("kind", kind).maybeSingle();
      if (error) throw new Error(error.message);
      return data ? { body: data.body, rev: Number(data.rev) } : null;
    },

    async saveDoc(kind, body, expectedRev) {
      try {
        const client = await getClient();
        const { data: sess } = await client.auth.getSession();
        const userId = sess.session?.user.id;
        if (!userId) return { ok: false, reason: "auth" };
        const query = client.from(TABLE);
        const { data, error } =
          expectedRev === null
            ? await query.insert({ user_id: userId, kind, body }).select("rev")
            : await query.update({ body }).eq("kind", kind).eq("rev", expectedRev).select("rev");
        if (error) return { ok: false, reason: failReason(error) };
        const row = (data as Array<{ rev: number }> | null)?.[0];
        if (!row) return { ok: false, reason: "conflict" };
        return { ok: true, rev: Number(row.rev) };
      } catch (e) {
        return { ok: false, reason: isNetworkFailure(e) ? "offline" : "error" };
      }
    },
  };
}

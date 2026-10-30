// Pure decisions for account sync. No I/O.

export type DocKind = "plan" | "schedule" | "registration";
export const DOC_KINDS: readonly DocKind[] = ["plan", "schedule", "registration"];

/** Object keys sorted at every level: Postgres jsonb doesn't keep key order. */
const sortKeys = (x: unknown): unknown =>
  Array.isArray(x)
    ? x.map(sortKeys)
    : x !== null && typeof x === "object"
      ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, sortKeys((x as Record<string, unknown>)[k])]))
      : x;

/** Canonical form so formatting and key-order differences don't count as a difference. */
function canon(raw: string): string {
  try {
    return JSON.stringify(sortKeys(JSON.parse(raw)));
  } catch {
    return raw;
  }
}

export function decideOnSignIn(
  local: string | null,
  remote: string | null,
): "nothing" | "upload" | "download" | "ask" {
  if (local === null && remote === null) return "nothing";
  if (remote === null) return "upload";
  if (local === null) return "download";
  return canon(local) === canon(remote) ? "nothing" : "ask";
}

export function decideOnFocus(
  localRev: number | undefined,
  remoteRev: number | undefined,
  localDirty: boolean,
): "nothing" | "download" | "upload" {
  if (remoteRev === undefined) return "nothing";
  if (localRev !== undefined && remoteRev <= localRev) return "nothing";
  // Unsaved edits are the newest change, so they win over the server's copy.
  return localDirty ? "upload" : "download";
}

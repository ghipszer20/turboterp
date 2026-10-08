// Pure decisions for account sync. No I/O.

export type DocKind = "plan" | "schedule" | "registration";
export const DOC_KINDS: readonly DocKind[] = ["plan", "schedule", "registration"];

/** Canonical form so formatting differences don't count as a difference. */
function canon(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw));
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
): "nothing" | "download" | "ask" {
  if (remoteRev === undefined) return "nothing";
  if (localRev !== undefined && remoteRev <= localRev) return "nothing";
  return localDirty ? "ask" : "download";
}

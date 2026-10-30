// Sends the signed agreement to /api/consent (and links it to the account after sign-in).
// Failures are quiet: the record stays unsent and is tried again on the next page load.
import type { ConsentRecord } from "./consent";

export type ConsentSession = { userId: string | null; token: string | null };

/** The updated record to store, or null when nothing was sent or the send didn't succeed. */
export async function syncConsent(
  record: ConsentRecord,
  session: ConsentSession,
  fetchFn: typeof fetch = fetch,
): Promise<ConsentRecord | null> {
  const signedIn = session.userId !== null && session.token !== null;
  const needsLink = signedIn && record.linkedTo !== session.userId;
  if (record.recorded && !needsLink) return null;
  const deviceId = record.deviceId ?? crypto.randomUUID();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (signedIn) headers.Authorization = `Bearer ${session.token}`;
  try {
    const res = await fetchFn("/api/consent", {
      method: "POST",
      headers,
      body: JSON.stringify({ name: record.name, version: record.version, acceptedAt: record.acceptedAt, deviceId }),
    });
    if (res.status !== 200) return null; // 400 / 429 / 5xx: not retried until the next page load
    return { ...record, deviceId, recorded: true, ...(signedIn ? { linkedTo: session.userId as string } : {}) };
  } catch {
    return null;
  }
}

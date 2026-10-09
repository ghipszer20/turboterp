// Seat Alerts pure logic (docs/project/seat-alerts.md). No I/O here.

export type Watch = { id: string; userId: string; term: string; courseId: string; sectionId: string | null; lastAlertAt: string | null; doneAt: string | null };
export type SeatCount = { courseId: string; sectionId: string; open: number; waitlist: number; holdfile: number };
export type SeatState = SeatCount & { checkedAt: string };
export type Opening = SeatCount; // a section that went from 0 open to > 0

export const MAX_WATCHES = 20; // owner: up to 20 active watches
export const ALERT_COOLDOWN_MINUTES = 15; // owner: max 1 alert per watch per 15 minutes
export const COURSES_PER_REQUEST = 40; // owner: polite to Testudo, 40 per request

export const seatKey = (courseId: string, sectionId: string) => `${courseId}-${sectionId}`;

export function activeForTerm(watches: Watch[], term: string): Watch[] {
  return watches.filter((w) => w.term === term && !w.doneAt);
}

export function watchedCourses(watches: Watch[]): string[] {
  return [...new Set(watches.map((w) => w.courseId))].sort();
}

export function batches<T>(items: T[], size: number = COURSES_PER_REQUEST): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** New states to save and the openings. Sections absent from `fetched` keep their old state (outage-safe); first sightings are baselines. */
export function detectOpenings(prev: ReadonlyMap<string, SeatState>, fetched: SeatCount[], now: Date): { save: SeatState[]; openings: Opening[] } {
  const save: SeatState[] = [];
  const openings: Opening[] = [];
  for (const s of fetched) {
    const before = prev.get(seatKey(s.courseId, s.sectionId));
    if (before && before.open === 0 && s.open > 0) openings.push({ ...s });
    save.push({ ...s, checkedAt: now.toISOString() });
  }
  return { save, openings };
}

/** Active, and the last alert is older than the cooldown (or there was none). */
export function shouldAlert(w: Watch, now: Date): boolean {
  if (w.doneAt) return false;
  if (!w.lastAlertAt) return true;
  return now.getTime() - new Date(w.lastAlertAt).getTime() >= ALERT_COOLDOWN_MINUTES * 60_000;
}

/** Watches to alert per opening; one entry per watch; a user's any-section + section watches for the same opening collapse to the section watch. */
export function matchWatches(openings: Opening[], watches: Watch[], now: Date): { watch: Watch; opening: Opening }[] {
  const out: { watch: Watch; opening: Opening }[] = [];
  const used = new Set<string>(); // a watch alerts once per run even if several of its sections open
  for (const opening of openings) {
    const perUser = new Map<string, Watch>();
    for (const w of watches) {
      if (w.courseId !== opening.courseId || (w.sectionId !== null && w.sectionId !== opening.sectionId)) continue;
      if (used.has(w.id) || !shouldAlert(w, now)) continue;
      const kept = perUser.get(w.userId);
      if (!kept || (kept.sectionId === null && w.sectionId !== null)) perUser.set(w.userId, w);
    }
    for (const w of perUser.values()) {
      used.add(w.id);
      out.push({ watch: w, opening });
    }
  }
  return out;
}

export function alertText(o: Opening): { title: string; body: string } {
  return {
    title: `${o.courseId} ${o.sectionId} has ${o.open} open seat${o.open === 1 ? "" : "s"}`,
    body: o.waitlist > 0 ? `Waitlisted students may get it first. Waitlist: ${o.waitlist}.` : "Register on Testudo now. Waitlist: 0.",
  };
}

// View model for the Seat Alerts watch list. Pure; the API contract is in docs/project/seat-alerts-plan.md Task 2.

export const MAX_WATCHES = 20;

/** One watch as GET /api/seat-alerts/watches returns it (the Watch fields the page uses, plus its latest seat status). */
export type WatchRow = {
  id: string;
  term: string;
  courseId: string;
  sectionId: string | null;
  lastAlertAt: string | null;
  doneAt: string | null;
  status?: { open: number; waitlist: number; checkedAt: string } | null;
};

export type WatchesResponse = { term: string; watches: WatchRow[]; done: WatchRow[]; ended: number };

export function minutesSince(iso: string, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - Date.parse(iso)) / 60_000));
}

function ago(iso: string, now: Date): string {
  const m = minutesSince(iso, now);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h} hr ago` : `${Math.floor(h / 24)} d ago`;
}

export function watchRowView(w: WatchRow, now: Date) {
  const s = w.status ?? null;
  return {
    title: w.sectionId ? `${w.courseId} ${w.sectionId}` : `Any section of ${w.courseId}`,
    status: s ? (s.open > 0 ? `${s.open} open · waitlist ${s.waitlist}` : `Full · waitlist ${s.waitlist}`) : "Not checked yet",
    checked: s ? `Checked ${ago(s.checkedAt, now)}` : "",
    lastAlert: w.lastAlertAt ? `Last alert ${ago(w.lastAlertAt, now)}` : "",
    isOpen: !!s && s.open > 0,
  };
}

export const watchCount = (n: number) => `${n} of ${MAX_WATCHES} watches`;

export function endedNote(n: number): string | null {
  if (n <= 0) return null;
  return n === 1 ? "1 watch from last term has ended." : `${n} watches from last term have ended.`;
}

/** The watch (if any) that covers a section, or the whole course when sectionId is null. */
export function findWatch(watches: readonly WatchRow[], courseId: string, sectionId: string | null): WatchRow | undefined {
  return watches.find((w) => w.courseId === courseId && w.sectionId === sectionId);
}

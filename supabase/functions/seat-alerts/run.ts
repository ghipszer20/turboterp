import { alertText, batches, detectOpenings, matchWatches, seatKey, type SeatCount, type SeatState, type Watch } from "../../../apps/web/lib/seat-alerts/logic.ts";
import type { PushPayload, PushResult } from "./push.ts";
import type { DeviceSub, SeatAlertStore } from "../../../apps/web/lib/seat-alerts/store.ts";
import type { SeatRow } from "../../../packages/course-data/src/soc.ts";
import type { SeatsFile } from "../../../packages/course-data/src/soc-refresh.ts";

// Port of apps/web/lib/seat-alerts/run.ts for the Edge runtime: one run per minute.
// Owner rulings kept: only watched courses, 40 courses per request, one request at a time,
// 300 ms apart, one retry for a failed batch, never logs in to Testudo. New (docs/project/scaling-plan.md 4.3):
//   - seat counts come from scanSeats (no DOM);
//   - at most MAX_REQUESTS Testudo requests per run (retries count), watched courses checked
//     most-watched first;
//   - courses past the cap (and batches that failed) are compared against the 5-minute seats
//     file instead, so an opening there still alerts within 5 minutes.

/** Tapping a seat alert opens Testudo Drop/Add for the watched term (owner, 2026-10-29); the student logs in there. */
export const dropAddUrl = (term: string) => `https://app.testudo.umd.edu/#/main/dropAdd?termId=${encodeURIComponent(term)}`;

export const MAX_REQUESTS = 40;
export const RUN_BUDGET_MS = 100_000; // the Edge call limit is 150 s wall
export const BATCH_PAUSE_MS = 300;

/** The current term (null when nobody watches anything), its active watches and their saved states keyed `COURSE-SECTION`. */
export type AlertState = { term: string | null; watches: Watch[]; states: Map<string, SeatState> };

export type RunDeps = {
  /** Everything the run reads from the database, in ONE request (the seat_alert_load RPC). */
  load: () => Promise<AlertState>;
  store: Pick<SeatAlertStore, "saveStates" | "markAlerted" | "subscriptionsFor" | "deleteDevice">;
  /** Seat counts of one batch of courses straight from Testudo (scanSeats of the sections page). */
  fetchSeats: (term: string, courseIds: string[]) => Promise<SeatRow[]>;
  /** schedule/<term>/seats, the whole-term file the 5-minute job keeps, or null. */
  seatsFile: (term: string) => Promise<SeatsFile | null>;
  push: (sub: DeviceSub, payload: PushPayload) => Promise<PushResult>;
  /** Signed "I got it" token for a watch id (api.ts signWatchToken with CRON_SECRET). */
  signToken: (watchId: string) => string;
  sleep: (ms: number) => Promise<void>;
  /** Milliseconds, monotonic. */
  clock: () => number;
};

export type RunReport = {
  watches: number;
  courses: number;
  /** Testudo requests made, retries included. Never above MAX_REQUESTS. */
  requests: number;
  /** Courses checked live at Testudo / covered by the seats file instead. */
  checkedLive: number;
  fromSeatsFile: number;
  openings: number;
  alerts: number;
  gone: number;
  failedBatches: number;
};

/** Watched courses, most-watched first (ties alphabetical). */
export function courseOrder(watches: Watch[]): string[] {
  const count = new Map<string, number>();
  for (const w of watches) count.set(w.courseId, (count.get(w.courseId) ?? 0) + 1);
  return [...count].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).map(([id]) => id);
}

const seatCounts = (rows: SeatRow[]): SeatCount[] => rows.map(([courseId, sectionId, , open, waitlist, holdfile]) => ({ courseId, sectionId, open, waitlist, holdfile }));

/** The seats file's entries for these courses ("COURSE-SECTION": [open, waitlist, holdfile, total]). */
function fromFile(file: SeatsFile, courses: Set<string>): SeatCount[] {
  const out: SeatCount[] = [];
  for (const [key, [open, waitlist, holdfile]] of Object.entries(file.seats)) {
    const dash = key.indexOf("-");
    const courseId = key.slice(0, dash);
    if (courses.has(courseId)) out.push({ courseId, sectionId: key.slice(dash + 1), open, waitlist, holdfile });
  }
  return out;
}

export async function runSeatAlerts(deps: RunDeps, now: Date): Promise<RunReport> {
  const report: RunReport = { watches: 0, courses: 0, requests: 0, checkedLive: 0, fromSeatsFile: 0, openings: 0, alerts: 0, gone: 0, failedBatches: 0 };
  const loaded = await deps.load();
  const term = loaded.term;
  if (!term) return report;
  const watches = loaded.watches;
  const prev = loaded.states;
  report.watches = watches.length;
  if (watches.length === 0) return report;

  const order = courseOrder(watches);
  report.courses = order.length;
  const started = deps.clock();

  /** Saved states vs these fresh counts: save, detect openings, push to the matching watches. */
  const handleBatch = async (courses: string[], fetched: SeatCount[], onlyNewerThan?: string) => {
    // Seats-file counts older than what a live check already saved would undo it; only act on a newer file.
    const fresh = onlyNewerThan === undefined ? fetched : fetched.filter((s) => {
      const before = prev.get(seatKey(s.courseId, s.sectionId));
      return !before || before.checkedAt < onlyNewerThan;
    });
    const { save, openings } = detectOpenings(prev, fresh, now);
    // Write only what changed: most runs change nothing, and then make no write request at all.
    const changed = save.filter((s) => {
      const before = prev.get(seatKey(s.courseId, s.sectionId));
      return !before || before.open !== s.open || before.waitlist !== s.waitlist || before.holdfile !== s.holdfile;
    });
    if (changed.length > 0) await deps.store.saveStates(term, changed);
    for (const s of changed) prev.set(seatKey(s.courseId, s.sectionId), s);
    report.openings += openings.length;

    const matches = matchWatches(openings, watches.filter((w) => courses.includes(w.courseId)), now);
    if (matches.length === 0) return;
    const subs = await deps.store.subscriptionsFor([...new Set(matches.map((m) => m.watch.deviceId))]);
    const alerted = new Set<string>();
    for (const { watch, opening } of matches) {
      const payload: PushPayload = { ...alertText(opening), url: dropAddUrl(watch.term), watchId: watch.id, token: deps.signToken(watch.id) };
      for (const sub of subs.filter((s) => s.deviceId === watch.deviceId)) {
        const result = await deps.push(sub, payload);
        if (result === "ok") { report.alerts++; alerted.add(watch.id); }
        else if (result === "gone") { report.gone++; await deps.store.deleteDevice(sub.deviceId); }
      }
    }
    await deps.store.markAlerted([...alerted], now);
  };

  const covered = new Set<string>();
  const list = batches(order);
  for (let i = 0; i < list.length && report.requests < MAX_REQUESTS; i++) {
    const batch = list[i]!;
    if (i > 0) {
      if (deps.clock() - started >= RUN_BUDGET_MS) break;
      await deps.sleep(BATCH_PAUSE_MS);
    }
    let rows: SeatRow[] | null = null;
    for (let attempt = 0; attempt < 2 && rows === null && report.requests < MAX_REQUESTS; attempt++) {
      report.requests++;
      try { rows = await deps.fetchSeats(term, batch); } catch { /* retried once */ }
    }
    if (rows === null) { report.failedBatches++; continue; }
    for (const id of batch) covered.add(id);
    report.checkedLive += batch.length;
    await handleBatch(batch, seatCounts(rows));
  }

  // Past the cap (or failed): the seats file already holds every section, refreshed every 5 minutes.
  const rest = order.filter((id) => !covered.has(id));
  if (rest.length > 0) {
    const file = await deps.seatsFile(term);
    if (file) {
      for (const batch of batches(rest)) {
        report.fromSeatsFile += batch.length;
        await handleBatch(batch, fromFile(file, new Set(batch)), file.generatedAt);
      }
    }
  }
  return report;
}

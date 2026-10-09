import type { Section } from "@turboterp/course-data";
import { activeForTerm, alertText, batches, detectOpenings, matchWatches, watchedCourses, type SeatCount } from "./logic";
import type { PushPayload, PushResult } from "./push";
import type { SeatAlertStore, PushSub } from "./store";

// One cron run. Owner rulings: only watched courses, 40 per request, one request at a time,
// 300 ms apart, one retry for a failed batch, a 50 s budget with a cursor. Never logs in to Testudo.

export const RUN_BUDGET_MS = 50_000;
export const BATCH_PAUSE_MS = 300;

export type RunDeps = {
  /** The current Schedule of Classes term (snapshot `schedule/current`), or null. */
  term: () => Promise<string | null>;
  store: SeatAlertStore;
  fetchSections: (term: string, courseIds: string[]) => Promise<Section[]>;
  push: (sub: PushSub, payload: PushPayload) => Promise<PushResult>;
  /** Signed "I got it" token for a watch id (api.ts signWatchToken with CRON_SECRET). */
  signToken: (watchId: string) => string;
  sleep: (ms: number) => Promise<void>;
  /** Milliseconds, monotonic. */
  clock: () => number;
};

export type RunReport = { watches: number; courses: number; requests: number; openings: number; alerts: number; gone: number; failedBatches: number; cursor?: string };

export async function runSeatAlerts(deps: RunDeps, now: Date): Promise<RunReport> {
  const report: RunReport = { watches: 0, courses: 0, requests: 0, openings: 0, alerts: 0, gone: 0, failedBatches: 0 };
  const term = await deps.term();
  if (!term) return report;
  const watches = activeForTerm(await deps.store.listActiveWatches(term), term);
  report.watches = watches.length;
  if (watches.length === 0) return report;

  const cursor = await deps.store.getCursor();
  const courses = watchedCourses(watches).filter((c) => cursor === null || c >= cursor);
  report.courses = courses.length;
  const started = deps.clock();

  const list = batches(courses);
  let nextCursor: string | null = null;
  for (let i = 0; i < list.length; i++) {
    const batch = list[i]!;
    if (i > 0) {
      if (deps.clock() - started >= RUN_BUDGET_MS) { nextCursor = batch[0]!; break; }
      await deps.sleep(BATCH_PAUSE_MS);
    }

    let sections: Section[] | null = null;
    for (let attempt = 0; attempt < 2 && sections === null; attempt++) {
      report.requests++;
      try { sections = await deps.fetchSections(term, batch); } catch { /* retried once */ }
    }
    if (sections === null) { report.failedBatches++; continue; }

    const fetched: SeatCount[] = sections.map((s) => ({ courseId: s.courseId, sectionId: s.id, open: s.seats.open, waitlist: s.seats.waitlist, holdfile: s.seats.holdfile }));
    const { save, openings } = detectOpenings(await deps.store.getStates(term, batch), fetched, now);
    await deps.store.saveStates(term, save);
    report.openings += openings.length;

    const matches = matchWatches(openings, watches.filter((w) => batch.includes(w.courseId)), now);
    if (matches.length === 0) continue;
    const subs = await deps.store.subscriptionsFor([...new Set(matches.map((m) => m.watch.userId))]);
    const alerted = new Set<string>();
    for (const { watch, opening } of matches) {
      const payload: PushPayload = { ...alertText(opening), url: `/schedule/alerts?watch=${watch.id}`, watchId: watch.id, token: deps.signToken(watch.id) };
      for (const sub of subs.filter((s) => s.userId === watch.userId)) {
        const result = await deps.push(sub, payload);
        if (result === "ok") { report.alerts++; alerted.add(watch.id); }
        else if (result === "gone") { report.gone++; await deps.store.deleteSubscription(sub.endpoint); }
      }
    }
    await deps.store.markAlerted([...alerted], now);
  }

  if (nextCursor !== null) report.cursor = nextCursor;
  if (nextCursor !== null || cursor !== null) await deps.store.setCursor(nextCursor);
  return report;
}

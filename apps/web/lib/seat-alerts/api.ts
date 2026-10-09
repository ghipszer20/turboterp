import { createHmac, timingSafeEqual } from "node:crypto";
import type { PlanEmailDeps, PlanUser } from "../email/plan";
import { MAX_WATCHES, seatKey, type Watch } from "./logic";
import type { PushPayload, PushResult } from "./push";
import type { PushSub, SeatAlertStore, UserPushSub } from "./store";

// Server-only handlers for /api/seat-alerts/*, with their dependencies injected (like lib/account/delete.ts).
// Data access is service-role only; every handler resolves the bearer token and enforces ownership here.

export const TOKEN_DAYS = 7;
const DAY_MS = 86_400_000;

export type SeatApiStore = Pick<
  SeatAlertStore,
  "listWatches" | "getWatch" | "createWatch" | "markDone" | "deleteWatch" | "getStates" | "upsertSubscription" | "deleteSubscriptionFor" | "subscriptionsFor" | "deleteSubscription"
>;

export type CatalogHit = { courseExists: boolean; /** Open seats in the term's snapshot, or null when the section isn't there / not asked. */ sectionOpen: number | null };

export type SeatApiDeps = {
  getUser: PlanEmailDeps["getUser"];
  /** The current Schedule of Classes term, or null. */
  term: () => Promise<string | null>;
  /** Does the course (and section) exist in the current term's snapshot? */
  lookup: (term: string, courseId: string, sectionId: string | null) => Promise<CatalogHit>;
  store: SeatApiStore;
  push: (sub: PushSub, payload: PushPayload) => Promise<PushResult>;
  vapidConfigured: () => boolean;
  /** CRON_SECRET, the HMAC key for "I got it" tokens. */
  secret: string | undefined;
  now: () => Date;
};

const json = (body: unknown, status: number) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const COURSE = /^[A-Z]{4}\d{3}[A-Z]?$/;
const SECTION = /^[A-Z0-9]{1,6}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ---- signed watch token: `<expiryMs>.<hex hmac of "<watchId>.<expiryMs>">` ----

const mac = (watchId: string, exp: number, secret: string) => createHmac("sha256", secret).update(`${watchId}.${exp}`).digest("hex");

export function signWatchToken(watchId: string, secret: string, now: Date): string {
  const exp = now.getTime() + TOKEN_DAYS * DAY_MS;
  return `${exp}.${mac(watchId, exp, secret)}`;
}

export function verifyWatchToken(watchId: string, token: string, secret: string, now: Date): boolean {
  const m = /^(\d{1,15})\.([0-9a-f]{64})$/.exec(token);
  if (!m) return false;
  const exp = Number(m[1]);
  if (exp < now.getTime()) return false;
  const want = Buffer.from(mac(watchId, exp, secret), "hex");
  const got = Buffer.from(m[2]!, "hex");
  return want.length === got.length && timingSafeEqual(want, got);
}

// ---- auth ----

async function authenticate(request: Request, deps: SeatApiDeps): Promise<PlanUser | Response> {
  const token = /^Bearer\s+(\S+)$/i.exec(request.headers.get("authorization") ?? "")?.[1];
  if (!token) return json({ error: "unauthorized" }, 401);
  let user: PlanUser | null;
  try {
    user = await deps.getUser(token);
  } catch {
    return json({ error: "unavailable" }, 503);
  }
  return user ?? json({ error: "unauthorized" }, 401);
}

async function guarded(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch {
    return json({ error: "unavailable" }, 503);
  }
}

async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const b = (await request.json()) as unknown;
    return b && typeof b === "object" && !Array.isArray(b) ? (b as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

// ---- watches ----

export async function handleWatchesGet(request: Request, deps: SeatApiDeps): Promise<Response> {
  const user = await authenticate(request, deps);
  if (user instanceof Response) return user;
  return guarded(async () => {
    const term = await deps.term();
    if (!term) return json({ error: "unavailable" }, 503);
    const all = await deps.store.listWatches(user.id);
    const active = all.filter((w) => w.doneAt === null && w.term === term);
    const states = await deps.store.getStates(term, [...new Set(active.map((w) => w.courseId))]);
    const watches = active.map((w) => {
      const s = w.sectionId ? states.get(seatKey(w.courseId, w.sectionId)) : undefined;
      return { ...w, status: s ? { open: s.open, waitlist: s.waitlist, checkedAt: s.checkedAt } : null };
    });
    const done = all.filter((w) => w.doneAt !== null && w.term === term);
    const ended = all.filter((w) => w.doneAt === null && w.term !== term).length;
    return json({ term, watches, done, ended }, 200);
  });
}

export async function handleWatchCreate(request: Request, deps: SeatApiDeps): Promise<Response> {
  const user = await authenticate(request, deps);
  if (user instanceof Response) return user;
  const body = await readBody(request);
  const courseId = body?.courseId;
  const sectionId = body?.sectionId;
  if (typeof courseId !== "string" || !COURSE.test(courseId) || sectionId === undefined || (sectionId !== null && (typeof sectionId !== "string" || !SECTION.test(sectionId)))) {
    return json({ error: "bad-request" }, 400);
  }
  return guarded(async () => {
    const term = await deps.term();
    if (!term) return json({ error: "unavailable" }, 503);
    const hit = await deps.lookup(term, courseId, sectionId);
    if (!hit.courseExists || (sectionId !== null && hit.sectionOpen === null)) return json({ error: "not-found" }, 404);

    const mine = (await deps.store.listWatches(user.id)).filter((w) => w.doneAt === null && w.term === term);
    const existing = mine.find((w) => w.courseId === courseId && w.sectionId === sectionId);
    if (existing) return json({ watch: existing }, 200);

    if (sectionId !== null) {
      const saved = (await deps.store.getStates(term, [courseId])).get(seatKey(courseId, sectionId));
      const open = saved ? saved.open : hit.sectionOpen!;
      if (open > 0) return json({ error: "open-now" }, 409);
    }
    if (mine.length >= MAX_WATCHES) return json({ error: "limit" }, 409);
    return json({ watch: await deps.store.createWatch(user.id, term, courseId, sectionId) }, 201);
  });
}

type Found = { watch: Watch } | Response;

async function ownedWatch(id: string, userId: string, deps: SeatApiDeps): Promise<Found> {
  const w = UUID.test(id) ? await deps.store.getWatch(id) : null;
  return w && w.userId === userId ? { watch: w } : json({ error: "not-found" }, 404);
}

/** "I got it": a bearer token (owner) or `?token=` (signed, from the push payload, for the service worker). */
export async function handleWatchDone(request: Request, id: string, deps: SeatApiDeps): Promise<Response> {
  const signed = new URL(request.url).searchParams.get("token");
  if (signed !== null) {
    if (!deps.secret || !verifyWatchToken(id, signed, deps.secret, deps.now())) return json({ error: "unauthorized" }, 401);
    return guarded(async () => {
      const w = UUID.test(id) ? await deps.store.getWatch(id) : null;
      if (!w) return json({ error: "not-found" }, 404);
      await deps.store.markDone(id, deps.now());
      return json({ ok: true }, 200);
    });
  }
  const user = await authenticate(request, deps);
  if (user instanceof Response) return user;
  return guarded(async () => {
    const found = await ownedWatch(id, user.id, deps);
    if (found instanceof Response) return found;
    await deps.store.markDone(id, deps.now());
    return json({ ok: true }, 200);
  });
}

export async function handleWatchDelete(request: Request, id: string, deps: SeatApiDeps): Promise<Response> {
  const user = await authenticate(request, deps);
  if (user instanceof Response) return user;
  return guarded(async () => {
    const found = await ownedWatch(id, user.id, deps);
    if (found instanceof Response) return found;
    await deps.store.deleteWatch(id);
    return json({ ok: true }, 200);
  });
}

// ---- push subscription ----

export async function handleSubscriptionSave(request: Request, deps: SeatApiDeps): Promise<Response> {
  const user = await authenticate(request, deps);
  if (user instanceof Response) return user;
  const body = await readBody(request);
  const keys = body?.keys as { p256dh?: unknown; auth?: unknown } | undefined;
  if (typeof body?.endpoint !== "string" || !body.endpoint.startsWith("https://") || typeof keys?.p256dh !== "string" || !keys.p256dh || typeof keys.auth !== "string" || !keys.auth) {
    return json({ error: "bad-request" }, 400);
  }
  const sub: PushSub = { endpoint: body.endpoint, p256dh: keys.p256dh, auth: keys.auth };
  return guarded(async () => {
    await deps.store.upsertSubscription(user.id, sub);
    return json({ ok: true }, 200);
  });
}

export async function handleSubscriptionDelete(request: Request, deps: SeatApiDeps): Promise<Response> {
  const user = await authenticate(request, deps);
  if (user instanceof Response) return user;
  const body = await readBody(request);
  if (typeof body?.endpoint !== "string" || !body.endpoint) return json({ error: "bad-request" }, 400);
  const endpoint = body.endpoint;
  return guarded(async () => {
    await deps.store.deleteSubscriptionFor(user.id, endpoint);
    return json({ ok: true }, 200);
  });
}

// ---- test alert ----

export async function handleTestAlert(request: Request, deps: SeatApiDeps): Promise<Response> {
  const user = await authenticate(request, deps);
  if (user instanceof Response) return user;
  if (!deps.vapidConfigured()) return json({ error: "not-configured" }, 503);
  return guarded(async () => {
    const subs: UserPushSub[] = await deps.store.subscriptionsFor([user.id]);
    let sent = 0;
    let gone = 0;
    for (const sub of subs) {
      const r = await deps.push(sub, { title: "Seat Alerts are on", body: "You will get a notification like this when a class you watch opens a seat.", url: "/schedule/alerts" });
      if (r === "ok") sent++;
      else if (r === "gone") { gone++; await deps.store.deleteSubscription(sub.endpoint); }
    }
    return json({ sent, gone }, 200);
  });
}

// ---- catalog lookup in a `schedule/<term>/sections/<DEPT>` file (packages/course-data/SCHEDULE_FILES.md) ----

type DeptFile = { courses?: Record<string, { s?: unknown[][] }> } | null;

export function lookupInDeptFile(file: unknown, courseId: string, sectionId: string | null): CatalogHit {
  const course = (file as DeptFile)?.courses?.[courseId];
  if (!course) return { courseExists: false, sectionOpen: null };
  if (sectionId === null) return { courseExists: true, sectionOpen: null };
  const s = course.s?.find((row) => row[0] === sectionId);
  return { courseExists: true, sectionOpen: s && typeof s[2] === "number" ? s[2] : null };
}

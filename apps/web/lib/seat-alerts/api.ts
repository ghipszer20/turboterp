import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { hashKey } from "../email/rate-limit";
import { MAX_WATCHES, seatKey, type Watch } from "./logic";
import type { PushPayload, PushResult } from "./push";
import type { PushSub, SeatAlertStore } from "./store";

// Server-only handlers for /api/seat-alerts/*, with their dependencies injected (like lib/account/delete.ts).
// Data access is service-role only; every handler resolves the device token and enforces ownership here.

export const TOKEN_DAYS = 7;
const DAY_MS = 86_400_000;

export type SeatApiStore = Pick<
  SeatAlertStore,
  "listWatches" | "getWatch" | "createWatch" | "markDone" | "deleteWatch" | "getStates" | "createDevice" | "getDevice" | "updateDeviceSub" | "deleteDevice" | "deleteDeviceByEndpoint"
>;

export type CatalogHit = { courseExists: boolean; /** Open seats in the term's snapshot, or null when the section isn't there / not asked. */ sectionOpen: number | null };

export type SeatApiDeps = {
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

export function parseDeviceToken(header: string | null): { deviceId: string; secret: string } | null {
  const m = /^Device ([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.([A-Za-z0-9_-]{16,128})$/i.exec(header ?? "");
  return m ? { deviceId: m[1]!, secret: m[2]! } : null;
}

type Device = { deviceId: string; secret: string };

async function authenticate(request: Request, deps: SeatApiDeps): Promise<Device | Response> {
  const t = parseDeviceToken(request.headers.get("authorization"));
  if (!t) return json({ error: "unauthorized" }, 401);
  let device: { id: string; secretHash: string } | null;
  try {
    device = await deps.store.getDevice(t.deviceId);
  } catch {
    return json({ error: "unavailable" }, 503);
  }
  if (!device) return json({ error: "unauthorized" }, 401);
  const want = Buffer.from(device.secretHash, "hex");
  const got = Buffer.from(hashKey(t.secret), "hex");
  return want.length === got.length && timingSafeEqual(want, got) ? t : json({ error: "unauthorized" }, 401);
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
  const device = await authenticate(request, deps);
  if (device instanceof Response) return device;
  return guarded(async () => {
    const term = await deps.term();
    if (!term) return json({ error: "unavailable" }, 503);
    const all = await deps.store.listWatches(device.deviceId);
    const active = all.filter((w) => w.doneAt === null && w.term === term);
    const states = await deps.store.getStates(term, [...new Set(active.map((w) => w.courseId))]);
    const watches = active.map((w) => {
      if (w.sectionId) {
        const s = states.get(seatKey(w.courseId, w.sectionId));
        return { ...w, status: s ? { open: s.open, waitlist: s.waitlist, checkedAt: s.checkedAt } : null };
      }
      // Any section: the course's totals, as of its most recent check.
      const course = [...states.values()].filter((s) => s.courseId === w.courseId);
      if (course.length === 0) return { ...w, status: null };
      const sum = (k: "open" | "waitlist") => course.reduce((n, s) => n + s[k], 0);
      const checkedAt = course.map((s) => s.checkedAt).reduce((a, b) => (b > a ? b : a));
      return { ...w, status: { open: sum("open"), waitlist: sum("waitlist"), checkedAt } };
    });
    const done = all.filter((w) => w.doneAt !== null && w.term === term);
    const ended = all.filter((w) => w.doneAt === null && w.term !== term).length;
    return json({ term, watches, done, ended }, 200);
  });
}

export async function handleWatchCreate(request: Request, deps: SeatApiDeps): Promise<Response> {
  const device = await authenticate(request, deps);
  if (device instanceof Response) return device;
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

    const mine = (await deps.store.listWatches(device.deviceId)).filter((w) => w.doneAt === null && w.term === term);
    const existing = mine.find((w) => w.courseId === courseId && w.sectionId === sectionId);
    if (existing) return json({ watch: existing }, 200);

    if (sectionId !== null) {
      const saved = (await deps.store.getStates(term, [courseId])).get(seatKey(courseId, sectionId));
      const open = saved ? saved.open : hit.sectionOpen!;
      if (open > 0) return json({ error: "open-now" }, 409);
    }
    if (mine.length >= MAX_WATCHES) return json({ error: "limit" }, 409);
    return json({ watch: await deps.store.createWatch(device.deviceId, term, courseId, sectionId) }, 201);
  });
}

type Found = { watch: Watch } | Response;

async function ownedWatch(id: string, deviceId: string, deps: SeatApiDeps): Promise<Found> {
  const w = UUID.test(id) ? await deps.store.getWatch(id) : null;
  return w && w.deviceId === deviceId ? { watch: w } : json({ error: "not-found" }, 404);
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
  const device = await authenticate(request, deps);
  if (device instanceof Response) return device;
  return guarded(async () => {
    const found = await ownedWatch(id, device.deviceId, deps);
    if (found instanceof Response) return found;
    await deps.store.markDone(id, deps.now());
    return json({ ok: true }, 200);
  });
}

export async function handleWatchDelete(request: Request, id: string, deps: SeatApiDeps): Promise<Response> {
  const device = await authenticate(request, deps);
  if (device instanceof Response) return device;
  return guarded(async () => {
    const found = await ownedWatch(id, device.deviceId, deps);
    if (found instanceof Response) return found;
    await deps.store.deleteWatch(id);
    return json({ ok: true }, 200);
  });
}

// ---- device registration ----

const PUSH_HOSTS = new Set(["web.push.apple.com", "fcm.googleapis.com", "updates.push.services.mozilla.com"]);

/** `https://` on a known push service: exact host match, or a host ending in `.notify.windows.com`. */
export function isKnownPushEndpoint(endpoint: string): boolean {
  let u: URL;
  try { u = new URL(endpoint); } catch { return false; }
  if (u.protocol !== "https:") return false;
  return PUSH_HOSTS.has(u.hostname) || u.hostname.endsWith(".notify.windows.com");
}

export const TEST_ALERT: PushPayload = {
  title: "Test: this is what a Seat Alert looks like",
  body: "When a seat opens in a class you watch, you'll get one like this.",
  url: "/alerts",
};

export async function handleDeviceRegister(request: Request, deps: SeatApiDeps): Promise<Response> {
  const body = await readBody(request);
  const keys = body?.keys as { p256dh?: unknown; auth?: unknown } | undefined;
  if (typeof body?.endpoint !== "string" || !isKnownPushEndpoint(body.endpoint) || typeof keys?.p256dh !== "string" || !keys.p256dh || typeof keys.auth !== "string" || !keys.auth) {
    return json({ error: "bad-request" }, 400);
  }
  if (!deps.vapidConfigured()) return json({ error: "not-configured" }, 503);
  const sub: PushSub = { endpoint: body.endpoint, p256dh: keys.p256dh, auth: keys.auth };
  return guarded(async () => {
    const existing = await authenticate(request, deps);
    if (!(existing instanceof Response)) {
      // Known device whose push service rotated its endpoint: keep its watches, send no second test.
      await deps.store.deleteDeviceByEndpoint(sub.endpoint, existing.deviceId);
      await deps.store.updateDeviceSub(existing.deviceId, sub);
      return json({ token: `${existing.deviceId}.${existing.secret}` }, 200);
    }
    if (existing.status === 503) return existing;
    // New device (or storage was cleared): a row that already has this endpoint is unreachable, so it goes with its watches.
    await deps.store.deleteDeviceByEndpoint(sub.endpoint);
    const secret = randomBytes(32).toString("base64url");
    const deviceId = await deps.store.createDevice({ secretHash: hashKey(secret), sub });
    let test: "ok" | "failed" = "failed";
    try {
      const r = await deps.push(sub, TEST_ALERT);
      if (r === "ok") test = "ok";
      else if (r === "gone") await deps.store.deleteDevice(deviceId);
    } catch { /* the device still exists; the test just failed */ }
    return json({ token: `${deviceId}.${secret}`, test }, 201);
  });
}

export async function handleDeviceDelete(request: Request, deps: SeatApiDeps): Promise<Response> {
  const device = await authenticate(request, deps);
  if (device instanceof Response) return device;
  return guarded(async () => {
    await deps.store.deleteDevice(device.deviceId);
    return json({ ok: true }, 200);
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

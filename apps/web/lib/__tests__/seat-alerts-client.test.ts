import { describe, expect, it } from "vitest";
import { alertsStatus, bellMode, onReturnToPage, pushSupport } from "../seat-alerts/client";
import { endedNote, MAX_WATCHES, minutesSince, watchRowView, type WatchRow } from "../seat-alerts/view";

const base = { hasServiceWorker: true, hasPushManager: true, hasNotification: true, standalone: false, maxTouchPoints: 0 };
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Version/17.4 Mobile/15E148 Safari/604.1";
const CHROME = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0 Safari/537.36";

describe("pushSupport", () => {
  it("supports desktop Chrome", () => expect(pushSupport({ ...base, userAgent: CHROME })).toBe("supported"));
  it("is unsupported without PushManager", () => expect(pushSupport({ ...base, userAgent: CHROME, hasPushManager: false })).toBe("unsupported"));
  it("asks iPhone Safari tabs for the Home Screen", () =>
    expect(pushSupport({ ...base, userAgent: IPHONE, hasPushManager: false })).toBe("ios-needs-home-screen"));
  it("treats iPhone in standalone mode as supported", () =>
    expect(pushSupport({ ...base, userAgent: IPHONE, standalone: true })).toBe("supported"));
  it("detects iPadOS posing as a Mac", () =>
    expect(pushSupport({ ...base, userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari", maxTouchPoints: 5, hasPushManager: false })).toBe("ios-needs-home-screen"));
});

describe("bellMode", () => {
  it("maps supported to watch, ios-needs-home-screen to link, unsupported to hidden", () => {
    expect(bellMode("supported")).toBe("watch");
    expect(bellMode("ios-needs-home-screen")).toBe("link");
    expect(bellMode("unsupported")).toBe("hidden");
  });
});

describe("alertsStatus", () => {
  it("is on when granted and subscribed", () => expect(alertsStatus("supported", "granted", true).kind).toBe("on"));
  it("is off when granted but this device is not subscribed", () => expect(alertsStatus("supported", "granted", false).kind).toBe("off"));
  it("is off when permission was never asked", () => expect(alertsStatus("supported", "default", false).kind).toBe("off"));
  it("is blocked when denied", () => expect(alertsStatus("supported", "denied", false).kind).toBe("blocked"));
  it("is unavailable with a guide on iPhone tabs", () => {
    const s = alertsStatus("ios-needs-home-screen", "default", false);
    expect(s.kind).toBe("unavailable");
    expect(s.guide).toBe(true);
  });
  it("is unavailable without a guide when unsupported", () => expect(alertsStatus("unsupported", "default", false).guide).toBe(false));
});

const now = new Date("2026-10-09T18:00:00Z");
const row = (p: Partial<WatchRow>): WatchRow => ({
  id: "w1", term: "202608", courseId: "CMSC351", sectionId: "0201", lastAlertAt: null, doneAt: null,
  status: { open: 0, waitlist: 4, checkedAt: "2026-10-09T17:58:00Z" }, ...p,
});

describe("watch view model", () => {
  it("words a full section with its waitlist", () => {
    const v = watchRowView(row({}), now);
    expect(v.title).toBe("CMSC351 0201");
    expect(v.status).toBe("Full · waitlist 4");
    expect(v.checked).toBe("Checked 2 min ago");
  });
  it("words an open section", () =>
    expect(watchRowView(row({ status: { open: 1, waitlist: 0, checkedAt: "2026-10-09T17:59:30Z" } }), now).status).toBe("1 open · waitlist 0"));
  it("words an all-sections watch", () => expect(watchRowView(row({ sectionId: null }), now).title).toBe("All sections of CMSC351"));
  it("handles a watch not checked yet", () => {
    const v = watchRowView(row({ status: null }), now);
    expect(v.status).toBe("Not checked yet");
    expect(v.checked).toBe("");
  });
  it("shows the last alert", () => expect(watchRowView(row({ lastAlertAt: "2026-10-09T17:30:00Z" }), now).lastAlert).toBe("Last alert 30 min ago"));
  it("counts minutes since a check", () => {
    expect(minutesSince("2026-10-09T17:59:50Z", now)).toBe(0);
    expect(minutesSince("2026-10-09T16:00:00Z", now)).toBe(120);
  });
  it("keeps the per-device watch limit at 20", () => {
    expect(MAX_WATCHES).toBe(20);
  });
  it("notes ended watches from older terms", () => {
    expect(endedNote(0)).toBeNull();
    expect(endedNote(1)).toBe("1 watch from last term has ended.");
    expect(endedNote(3)).toBe("3 watches from last term have ended.");
  });
});

describe("onReturnToPage", () => {
  it("calls back when the page becomes visible or regains focus, and stops after cleanup", () => {
    const doc = Object.assign(new EventTarget(), { visibilityState: "visible" as DocumentVisibilityState });
    const win = new EventTarget();
    let calls = 0;
    const stop = onReturnToPage(() => calls++, doc, win);
    doc.dispatchEvent(new Event("visibilitychange"));
    win.dispatchEvent(new Event("focus"));
    doc.visibilityState = "hidden";
    doc.dispatchEvent(new Event("visibilitychange"));
    expect(calls).toBe(2);
    stop();
    win.dispatchEvent(new Event("focus"));
    expect(calls).toBe(2);
  });
});

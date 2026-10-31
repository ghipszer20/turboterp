// Pure decisions for Seat Alerts on the phone: what this build can do, and what to do about
// notification permission. Permission is asked only when the student turns alerts on.

export type Availability = "ready" | "no-project" | "unsupported";

/** "unsupported": web, simulator or no push at all. "no-project": no EAS project id yet (no Expo account). */
export function availability(i: { platform: string; isDevice: boolean; projectId: string | null | undefined }): Availability {
  if (i.platform !== "ios" || !i.isDevice) return "unsupported";
  return i.projectId ? "ready" : "no-project";
}

export type PermissionInfo = { status: "granted" | "denied" | "undetermined"; canAskAgain: boolean };
export type PermissionPlan = "go" | "ask" | "settings";

/** granted: go; first time (or can still ask): ask; denied for good: send them to Settings. */
export function permissionPlan(p: PermissionInfo): PermissionPlan {
  if (p.status === "granted") return "go";
  if (p.status === "denied" && !p.canAskAgain) return "settings";
  return "ask";
}

export type NotificationTarget = { url: string | null; watchId: string | null };

/** Reads a push's data. Only https links open in the browser. */
export function notificationTarget(data: unknown): NotificationTarget {
  const d = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
  const url = typeof d.url === "string" && /^https:\/\//i.test(d.url) ? d.url : null;
  const watchId = typeof d.watchId === "string" && d.watchId ? d.watchId : null;
  return { url, watchId };
}

export const UNAVAILABLE_TEXT = "Notifications aren't available in this build";

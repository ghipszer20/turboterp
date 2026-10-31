// Web build: no push. The tab shows the plain "not available" state.
import type { Availability, NotificationTarget } from "./decisions";

export const pushAvailability = (): Availability => "unsupported";
export type EnableResult = { ok: true; expoToken: string } | { ok: false; reason: "settings" | "denied" | "unavailable" | "error" };
export const enablePush = async (): Promise<EnableResult> => ({ ok: false, reason: "unavailable" });
export const existingPushToken = async (): Promise<string | null> => null;
export const openSettings = () => undefined;
export const onNotificationTap = (...args: [(t: NotificationTarget) => void]): (() => void) => (args.length ? () => undefined : () => undefined);

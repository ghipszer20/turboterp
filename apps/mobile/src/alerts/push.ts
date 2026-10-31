// The phone's side of push: permission and the Expo push token. Native only (push.web.ts is the stub).
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { availability, notificationTarget, permissionPlan, type Availability, type NotificationTarget } from "./decisions";

const projectId = (): string | null => {
  const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;
  return extra?.eas?.projectId ?? null;
};

export const pushAvailability = (): Availability => availability({ platform: Platform.OS, isDevice: Constants.executionEnvironment !== ExecutionEnvironment.StoreClient, projectId: projectId() });

export type EnableResult = { ok: true; expoToken: string } | { ok: false; reason: "settings" | "denied" | "unavailable" | "error" };

async function currentToken(): Promise<string | null> {
  const id = projectId();
  if (!id) return null;
  return (await Notifications.getExpoPushTokenAsync({ projectId: id })).data;
}

/** Called only when the student turns alerts on: asks permission if needed, then returns the push token. */
export async function enablePush(): Promise<EnableResult> {
  if (pushAvailability() !== "ready") return { ok: false, reason: "unavailable" };
  try {
    let perm = await Notifications.getPermissionsAsync();
    let plan = permissionPlan(perm);
    if (plan === "ask") {
      perm = await Notifications.requestPermissionsAsync();
      plan = permissionPlan(perm);
      if (plan !== "go") return { ok: false, reason: perm.canAskAgain ? "denied" : "settings" };
    }
    if (plan === "settings") return { ok: false, reason: "settings" };
    const expoToken = await currentToken();
    return expoToken ? { ok: true, expoToken } : { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
}

/** The push token when permission was already granted; never prompts. */
export async function existingPushToken(): Promise<string | null> {
  if (pushAvailability() !== "ready") return null;
  try {
    const perm = await Notifications.getPermissionsAsync();
    return perm.status === "granted" ? await currentToken() : null;
  } catch {
    return null;
  }
}

export const openSettings = () => void Linking.openSettings();

/** Calls `handler` when the student taps a notification (also one that launched the app). Returns a cleanup. */
export function onNotificationTap(handler: (t: NotificationTarget) => void): () => void {
  const sub = Notifications.addNotificationResponseReceivedListener((r) => handler(notificationTarget(r.notification.request.content.data)));
  void Notifications.getLastNotificationResponseAsync().then((r) => {
    if (r) handler(notificationTarget(r.notification.request.content.data));
  });
  return () => sub.remove();
}

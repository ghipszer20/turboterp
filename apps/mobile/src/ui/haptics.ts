import * as Haptics from "expo-haptics";

/** Light tap on a primary action. Never throws (web and simulators have no haptics). */
export function tap(): void {
  try {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  } catch {
    // no haptics here
  }
}

export function success(): void {
  try {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  } catch {
    // no haptics here
  }
}

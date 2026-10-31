// A tapped alert opens its Drop/Add link in the browser, then offers "I got it".
import { useEffect } from "react";
import { Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { alertsStore } from "./store";
import { onNotificationTap } from "./push";

export function useNotificationTaps(): void {
  useEffect(
    () =>
      onNotificationTap(async (t) => {
        if (t.url) await WebBrowser.openBrowserAsync(t.url).catch(() => undefined);
        const id = t.watchId;
        if (!id) return;
        Alert.alert("Did you get the seat?", "Tap \"I got it\" and we'll stop watching this class.", [
          { text: "Not yet", style: "cancel" },
          { text: "I got it", onPress: () => void alertsStore.done(id) },
        ]);
      }),
    [],
  );
}

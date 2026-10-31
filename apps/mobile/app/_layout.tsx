import { Stack } from "expo-router";
import { initSentry } from "../src/sentry";

// No-op unless EXPO_PUBLIC_SENTRY_DSN is set.
initSentry();

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

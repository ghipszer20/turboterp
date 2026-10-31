import { Stack } from "expo-router";
import { SyncProvider } from "../src/auth/SyncProvider";
import { initSentry } from "../src/sentry";

// No-op unless EXPO_PUBLIC_SENTRY_DSN is set.
initSentry();

export default function RootLayout() {
  return (
    <SyncProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SyncProvider>
  );
}

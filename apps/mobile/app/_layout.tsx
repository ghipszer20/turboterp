import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { initSentry } from "../src/sentry";
import { ErrorBoundary } from "../src/ui";

// No-op unless EXPO_PUBLIC_SENTRY_DSN is set.
initSentry();

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="account" options={{ headerShown: true, title: "Account", presentation: "modal" }} />
        <Stack.Screen name="about" options={{ headerShown: true, title: "About", presentation: "modal" }} />
      </Stack>
    </ErrorBoundary>
  );
}

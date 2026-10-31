import { Stack } from "expo-router";
import { ConsentGate } from "../../../src/advisor/ConsentGate";

export default function Layout() {
  return (
    <ConsentGate>
      <Stack screenOptions={{ headerShown: false }} />
    </ConsentGate>
  );
}

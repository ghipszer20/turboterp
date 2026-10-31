import { Tabs } from "expo-router";

// Placeholder shell. B1 replaces this with the real tab bar and design system.
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#BA0C2F" }}>
      {/* Today is the home screen at "/", reached from the logo, not a tab. */}
      <Tabs.Screen name="index" options={{ title: "Today", href: null }} />
      <Tabs.Screen name="campus" options={{ title: "Campus" }} />
      <Tabs.Screen name="schedule" options={{ title: "Schedule" }} />
      <Tabs.Screen name="seat-alerts" options={{ title: "Seat Alerts" }} />
      <Tabs.Screen name="advisor" options={{ title: "Advisor" }} />
    </Tabs>
  );
}

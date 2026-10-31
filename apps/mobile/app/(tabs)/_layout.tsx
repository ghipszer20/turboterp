import { Tabs, Link } from "expo-router";
import { Pressable, type ColorValue } from "react-native";
import { Icon, Text, tap, useTheme, type IconName } from "../../src/ui";

function Logo() {
  const { c } = useTheme();
  return (
    <Link href="/" asChild>
      <Pressable accessibilityRole="link" accessibilityLabel="TurboTerp, go to Today" accessibilityHint="Opens the Today screen" onPress={tap}>
        <Text variant="headline" style={{ color: c.accent }}>
          TurboTerp
        </Text>
      </Pressable>
    </Link>
  );
}

function AboutButton() {
  const { c } = useTheme();
  return (
    <Link href="/about" asChild>
      <Pressable accessibilityRole="link" accessibilityLabel="About" hitSlop={10} style={{ paddingHorizontal: 16 }}>
        <Text variant="sub" style={{ color: c.text2 }}>
          About
        </Text>
      </Pressable>
    </Link>
  );
}

const tabIcon = (name: IconName) =>
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Icon name={name} size={size} color={color} />;
  };

export default function TabsLayout() {
  const { c } = useTheme();
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerTitle: () => <Logo />,
        headerRight: () => <AboutButton />,
        headerStyle: { backgroundColor: c.surface },
        headerShadowVisible: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.text3,
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.separator },
      }}
    >
      {/* Today is the home screen at "/", reached from the logo, not a tab. */}
      <Tabs.Screen name="index" options={{ title: "Today", tabBarButton: () => null }} />
      <Tabs.Screen name="campus" options={{ title: "Campus", tabBarIcon: tabIcon("campus"), tabBarAccessibilityLabel: "Campus" }} />
      <Tabs.Screen name="schedule" options={{ title: "Schedule", tabBarIcon: tabIcon("schedule"), tabBarAccessibilityLabel: "Schedule" }} />
      <Tabs.Screen name="seat-alerts" options={{ title: "Seat Alerts", tabBarIcon: tabIcon("alerts"), tabBarAccessibilityLabel: "Seat Alerts" }} />
      <Tabs.Screen name="advisor" options={{ title: "Advisor", tabBarIcon: tabIcon("advisor"), tabBarAccessibilityLabel: "Advisor" }} />
    </Tabs>
  );
}

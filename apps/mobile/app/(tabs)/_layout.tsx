import { Tabs, Link } from "expo-router";
import { Pressable, View, type ColorValue } from "react-native";
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
      <Pressable accessibilityRole="link" accessibilityLabel="About" hitSlop={10} style={{ paddingHorizontal: 12 }}>
        <Text variant="sub" style={{ color: c.text2 }}>
          About
        </Text>
      </Pressable>
    </Link>
  );
}

function AccountButton() {
  const { c } = useTheme();
  return (
    <Link href="/account" asChild>
      <Pressable accessibilityRole="button" accessibilityLabel="Account" hitSlop={10} onPress={tap}>
        <Icon name="account" size={24} color={c.text2} />
      </Pressable>
    </Link>
  );
}

function HeaderActions() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingRight: 16 }}>
      <AboutButton />
      <AccountButton />
    </View>
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
      screenOptions={{
        headerTitle: () => <Logo />,
        headerRight: () => <HeaderActions />,
        headerStyle: { backgroundColor: c.surface },
        headerShadowVisible: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.text3,
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.separator },
      }}
    >
      {/* Today is the home screen at "/", reached from the logo. It stays the first route (so "/" opens it) and its tab item is removed outright: tabBarButton null alone leaves an empty slot, display none takes the slot away. */}
      <Tabs.Screen name="index" options={{ title: "Today", tabBarButton: () => null, tabBarItemStyle: { display: "none" } }} />
      <Tabs.Screen name="campus" options={{ title: "Campus", tabBarIcon: tabIcon("campus"), tabBarAccessibilityLabel: "Campus" }} />
      <Tabs.Screen name="schedule" options={{ title: "Schedule", tabBarIcon: tabIcon("schedule"), tabBarAccessibilityLabel: "Schedule" }} />
      <Tabs.Screen name="seat-alerts" options={{ title: "Seat Alerts", tabBarIcon: tabIcon("alerts"), tabBarAccessibilityLabel: "Seat Alerts" }} />
      <Tabs.Screen name="advisor" options={{ title: "Advisor", tabBarIcon: tabIcon("advisor"), tabBarAccessibilityLabel: "Advisor" }} />
    </Tabs>
  );
}

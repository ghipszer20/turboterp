import { Stack, Link, usePathname } from "expo-router";
import { Pressable, View } from "react-native";
import { Text, radius, spacing, tap, useTheme } from "../../../src/ui";

const SUBNAV = [
  { label: "Dining", href: "/campus/dining", match: "/campus/dining" },
  { label: "Libraries", href: "/campus/libraries", match: "/campus/libraries" },
  { label: "Fitness", href: "/campus/gym", match: "/campus/gym" },
] as const;

/** Campus sub-nav: Dining, Libraries, Fitness. */
export default function CampusLayout() {
  const { c } = useTheme();
  const path = usePathname();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flexDirection: "row", gap: spacing.sm, padding: spacing.md, backgroundColor: c.surface }} accessibilityRole="tablist">
        {SUBNAV.map((s) => {
          const active = path.startsWith(s.match);
          return (
            <Link key={s.href} href={s.href} asChild replace>
              <Pressable
                onPress={tap}
                accessibilityRole="tab"
                accessibilityLabel={s.label}
                accessibilityState={{ selected: active }}
                style={{
                  flex: 1,
                  minHeight: 36,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: radius.pill,
                  backgroundColor: active ? c.accent : c.surface2,
                }}
              >
                <Text variant="sub" style={{ color: active ? c.onAccent : c.text, fontWeight: "600" }}>
                  {s.label}
                </Text>
              </Pressable>
            </Link>
          );
        })}
      </View>
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

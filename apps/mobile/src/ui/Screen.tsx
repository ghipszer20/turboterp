import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { Card } from "./primitives";
import { spacing } from "./theme";
import { Text } from "./Text";
import { useTheme } from "./useTheme";

/** Scrolling page with a large title. Width-capped and centered so iPad and small phones both work. */
export function Screen({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  const { c } = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ alignItems: "center", paddingBottom: spacing.xxl }}
    >
      <View style={{ width: "100%", maxWidth: 720, paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
        {subtitle ? (
          <Text variant="caption" tone="text2">
            {subtitle.toUpperCase()}
          </Text>
        ) : null}
        <Text variant="large" accessibilityRole="header" style={{ marginBottom: spacing.md }}>
          {title}
        </Text>
        {children}
      </View>
    </ScrollView>
  );
}

/** Stand-in body for a screen a later task fills in. */
export function PlaceholderScreen({ title, note = "This screen is on its way." }: { title: string; note?: string }) {
  return (
    <Screen title={title}>
      <Card style={{ padding: spacing.lg }}>
        <Text tone="text2">{note}</Text>
      </Card>
    </Screen>
  );
}

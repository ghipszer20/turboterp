import type { ReactNode } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { Text, radius, spacing, tap, useTheme } from "../ui";

/** A selectable pill used for halls, meals and filters. */
export function Chip({ label, pressed, onPress }: { label: string; pressed: boolean; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: pressed }}
      style={{
        minHeight: 36,
        paddingHorizontal: spacing.md,
        justifyContent: "center",
        borderRadius: radius.pill,
        backgroundColor: pressed ? c.accent : c.surface2,
      }}
    >
      <Text variant="sub" style={{ color: pressed ? c.onAccent : c.text, fontWeight: "600" }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ChipRow({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>{children}</View>;
}

/** Scrolling page body with pull-to-refresh, width-capped like Screen. */
export function RefreshPage({
  title,
  subtitle,
  refreshing,
  onRefresh,
  children,
}: {
  title: string;
  subtitle?: string;
  refreshing: boolean;
  onRefresh: () => void;
  children: ReactNode;
}) {
  const { c } = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ alignItems: "center", paddingBottom: spacing.xxl }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={{ width: "100%", maxWidth: 720, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.md }}>
        {subtitle ? (
          <Text variant="caption" tone="text2">
            {subtitle.toUpperCase()}
          </Text>
        ) : null}
        <Text variant="large" accessibilityRole="header">
          {title}
        </Text>
        {children}
      </View>
    </ScrollView>
  );
}

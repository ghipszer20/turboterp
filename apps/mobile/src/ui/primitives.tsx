import { useEffect, useState, type ReactNode } from "react";
import { Animated, Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import { Link, type Href } from "expo-router";
import { tap } from "./haptics";
import { Icon } from "./Icon";
import { radius, spacing, statusColors, statusLabel, type Status } from "./theme";
import { Text } from "./Text";
import { useTheme } from "./useTheme";

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return <View style={[{ backgroundColor: c.surface, borderRadius: radius.lg, overflow: "hidden" }, style]}>{children}</View>;
}

/** The one main action on a screen. Full accent fill. */
export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  accessibilityHint?: string;
}) {
  const { c } = useTheme();
  const primary = variant === "primary";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={() => {
        if (primary) tap();
        onPress();
      }}
      style={({ pressed }) => ({
        minHeight: 50,
        borderRadius: radius.md,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.4 : 1,
        backgroundColor: primary ? (pressed ? c.accentPressed : c.accent) : pressed ? c.surfacePressed : c.accentTint,
      })}
    >
      <Text variant="headline" style={{ color: primary ? c.onAccent : c.accent, textAlign: "center" }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.xs,
        marginTop: spacing.xl,
        marginBottom: spacing.sm,
      }}
    >
      <Text variant="title" accessibilityRole="header" style={{ flexShrink: 1 }}>
        {title}
      </Text>
      {action}
    </View>
  );
}

/** A row in a Card. With `href` or `onPress` it is a single VoiceOver control. */
export function ListRow({
  title,
  subtitle,
  trailing,
  href,
  onPress,
  last,
}: {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  href?: Href;
  onPress?: () => void;
  last?: boolean;
}) {
  const { c } = useTheme();
  const interactive = !!href || !!onPress;
  const body = (pressed: boolean) => (
    <View
      style={{
        minHeight: 56,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: pressed ? c.surfacePressed : "transparent",
        borderBottomWidth: last ? 0 : 0.5,
        borderBottomColor: c.separator,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text variant="body">{title}</Text>
        {subtitle ? (
          <Text variant="sub" tone="text2">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
      {interactive ? <Icon name="chevron" size={14} color={c.text3} /> : null}
    </View>
  );
  const label = subtitle ? `${title}, ${subtitle}` : title;
  if (href) {
    return (
      <Link href={href} asChild>
        <Pressable accessibilityRole="link" accessibilityLabel={label}>
          {({ pressed }) => body(pressed)}
        </Pressable>
      </Link>
    );
  }
  if (onPress) {
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}>
        {({ pressed }) => body(pressed)}
      </Pressable>
    );
  }
  return (
    <View accessible accessibilityLabel={label}>
      {body(false)}
    </View>
  );
}

/** Status pill. Color means open, closing soon, closed. Always carries text, never color alone. */
export function StatusBadge({ status, label }: { status: Status; label?: string }) {
  const { c } = useTheme();
  const { fg, tint } = statusColors(status, c);
  const text = label ?? statusLabel[status];
  return (
    <View
      accessible
      accessibilityLabel={text}
      style={{ backgroundColor: tint, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 3 }}
    >
      <Text variant="caption" style={{ color: fg }}>
        {text}
      </Text>
    </View>
  );
}

/** Neutral or accent-tinted label. */
export function Badge({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "accent" }) {
  const { c } = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={label}
      style={{
        backgroundColor: tone === "accent" ? c.accentTint : c.closedTint,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.md,
        paddingVertical: 3,
      }}
    >
      <Text variant="caption" style={{ color: tone === "accent" ? c.accent : c.text2 }}>
        {label}
      </Text>
    </View>
  );
}

/** Pulsing placeholder rows while loading. */
export function Skeleton({ rows = 3 }: { rows?: number }) {
  const { c } = useTheme();
  const [pulse] = useState(() => new Animated.Value(0.5));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return (
    <Card>
      <View accessible accessibilityLabel="Loading" accessibilityState={{ busy: true }} style={{ padding: spacing.lg, gap: spacing.lg }}>
        {Array.from({ length: rows }, (_, i) => (
          <Animated.View key={i} style={{ opacity: pulse, flexDirection: "row", alignItems: "center", gap: spacing.md }}>
            <View style={{ width: 36, height: 36, borderRadius: radius.sm, backgroundColor: c.surfacePressed }} />
            <View style={{ flex: 1, gap: 6 }}>
              <View style={{ height: 12, width: "70%", borderRadius: 6, backgroundColor: c.surfacePressed }} />
              <View style={{ height: 10, width: "45%", borderRadius: 5, backgroundColor: c.surfacePressed }} />
            </View>
          </Animated.View>
        ))}
      </View>
    </Card>
  );
}

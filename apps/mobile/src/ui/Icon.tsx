import { Platform, type ColorValue, Text as RNText } from "react-native";
import { SymbolView } from "expo-symbols";

// SF Symbol name plus a plain fallback glyph for web, Android and surfaces without symbols.
const ICONS = {
  campus: { sf: "building.2", glyph: "▣" },
  schedule: { sf: "calendar", glyph: "▦" },
  alerts: { sf: "bell", glyph: "♪" },
  advisor: { sf: "graduationcap", glyph: "★" },
  chevron: { sf: "chevron.right", glyph: "›" },
  warning: { sf: "exclamationmark.triangle", glyph: "!" },
  offline: { sf: "wifi.slash", glyph: "✕" },
  empty: { sf: "tray", glyph: "∅" },
  account: { sf: "person.crop.circle", glyph: "☺" },
} as const;

export type IconName = keyof typeof ICONS;

/** Decorative icon (hidden from VoiceOver; the control around it carries the label). */
export function Icon({ name, size = 22, color }: { name: IconName; size?: number; color: ColorValue }) {
  const i = ICONS[name];
  if (Platform.OS === "ios") {
    return <SymbolView name={i.sf} size={size} tintColor={color} accessibilityElementsHidden importantForAccessibility="no" />;
  }
  return (
    <RNText
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={{ fontSize: size, lineHeight: size + 4, color, textAlign: "center", width: size + 4 }}
    >
      {i.glyph}
    </RNText>
  );
}

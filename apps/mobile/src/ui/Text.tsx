import { Text as RNText, type TextProps } from "react-native";
import { MAX_FONT_SCALE, type, type TypeName } from "./theme";
import { useTheme } from "./useTheme";

type Props = TextProps & { variant?: TypeName; tone?: "text" | "text2" | "text3" | "accent" | "danger" };

/** Themed text. Scales with Dynamic Type, capped so layouts hold. */
export function Text({ variant = "body", tone = "text", style, ...rest }: Props) {
  const { c } = useTheme();
  return <RNText maxFontSizeMultiplier={MAX_FONT_SCALE} style={[type[variant], { color: c[tone] }, style]} {...rest} />;
}

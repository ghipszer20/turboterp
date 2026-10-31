import { useColorScheme } from "react-native";
import { palettes, resolveScheme, type Palette, type Scheme } from "./theme";

/** Current palette. Follows the device's light/dark setting (a saved override can be passed in later). */
export function useTheme(saved?: string | null): { scheme: Scheme; c: Palette } {
  const scheme = resolveScheme(saved, useColorScheme());
  return { scheme, c: palettes[scheme] };
}

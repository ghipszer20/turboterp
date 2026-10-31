// Design tokens, ported from apps/web/lib/theme.ts and the CSS variables in apps/web/app/globals.css.
// Pure TypeScript (no react-native import) so it can be unit-tested in Node.
// Color rule: the accent at full strength only on buttons, active tabs and highlights; pale tints for backgrounds.

export type Scheme = "light" | "dark";
export type Status = "open" | "soon" | "closed" | "unknown";

export type Palette = {
  bg: string;
  surface: string;
  surface2: string;
  surfacePressed: string;
  separator: string;
  text: string;
  text2: string;
  text3: string;
  accent: string;
  accentPressed: string;
  accentTint: string;
  onAccent: string;
  open: string;
  openTint: string;
  soon: string;
  soonTint: string;
  closed: string;
  closedTint: string;
  danger: string;
};

export const light: Palette = {
  bg: "#f5f5f7",
  surface: "#ffffff",
  surface2: "#f2f2f7",
  surfacePressed: "#e8e8ed",
  separator: "rgba(60,60,67,0.14)",
  text: "#1d1d1f",
  text2: "#6e6e73",
  text3: "#8e8e93",
  accent: "#ba0c2f",
  accentPressed: "#a10a28",
  accentTint: "rgba(186,12,47,0.08)",
  onAccent: "#ffffff",
  open: "#248a3d",
  openTint: "rgba(36,138,61,0.1)",
  soon: "#b25000",
  soonTint: "rgba(178,80,0,0.1)",
  closed: "#8e8e93",
  closedTint: "rgba(142,142,147,0.12)",
  danger: "#c0392b",
};

// Brighter red in dark mode so it keeps contrast on dark surfaces.
export const dark: Palette = {
  bg: "#000000",
  surface: "#1c1c1e",
  surface2: "#2c2c2e",
  surfacePressed: "#3a3a3c",
  separator: "rgba(84,84,88,0.5)",
  text: "#f5f5f7",
  text2: "#a1a1a6",
  text3: "#8e8e93",
  accent: "#ff4f6d",
  accentPressed: "#ff6b84",
  accentTint: "rgba(255,79,109,0.14)",
  onAccent: "#1c0006",
  open: "#30d158",
  openTint: "rgba(48,209,88,0.14)",
  soon: "#ff9f0a",
  soonTint: "rgba(255,159,10,0.14)",
  closed: "#8e8e93",
  closedTint: "rgba(142,142,147,0.18)",
  danger: "#ff6961",
};

export const palettes: Record<Scheme, Palette> = { light, dark };

/** The saved choice wins; otherwise the device setting decides (same rule as the web). */
export function resolveScheme(saved: string | null | undefined, system: string | null | undefined): Scheme {
  if (saved === "light" || saved === "dark") return saved;
  return system === "dark" ? "dark" : "light";
}

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 10, md: 14, lg: 20, pill: 999 } as const;

export type TypeStyle = { fontSize: number; lineHeight: number; fontWeight: "400" | "500" | "600" | "700" };

/** Same scale as the web's --t-* variables. RN Text scales these with Dynamic Type automatically. */
export const type = {
  large: { fontSize: 34, lineHeight: 38, fontWeight: "700" },
  title: { fontSize: 22, lineHeight: 26, fontWeight: "700" },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: "600" },
  body: { fontSize: 17, lineHeight: 24, fontWeight: "400" },
  sub: { fontSize: 15, lineHeight: 20, fontWeight: "400" },
  foot: { fontSize: 13, lineHeight: 17, fontWeight: "400" },
  caption: { fontSize: 12, lineHeight: 15, fontWeight: "500" },
} satisfies Record<string, TypeStyle>;

export type TypeName = keyof typeof type;

/** Largest Dynamic Type multiplier before layouts would break. */
export const MAX_FONT_SCALE = 1.6;

export const statusLabel: Record<Status, string> = {
  open: "Open",
  soon: "Closing soon",
  closed: "Closed",
  unknown: "Hours unknown",
};

/** Foreground and tint for a status. Color only where it means something. */
export function statusColors(status: Status, p: Palette): { fg: string; tint: string } {
  switch (status) {
    case "open":
      return { fg: p.open, tint: p.openTint };
    case "soon":
      return { fg: p.soon, tint: p.soonTint };
    default:
      return { fg: p.closed, tint: p.closedTint };
  }
}

/**
 * What a screen shows. Never blank: loading shows a skeleton, offline and error offer Retry.
 * Cached data wins over an error or offline notice only if the caller renders it (see ScreenState).
 */
export type ScreenStateKind = "loading" | "offline" | "error" | "empty" | "ready";

export function resolveScreenState(s: {
  loading?: boolean;
  offline?: boolean;
  error?: unknown;
  hasData?: boolean;
}): ScreenStateKind {
  if (s.hasData) return "ready";
  if (s.loading) return "loading";
  if (s.offline) return "offline";
  if (s.error) return "error";
  return "empty";
}

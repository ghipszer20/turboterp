// The eight course colors (fill, ink, solid) from the web's --course-N-* variables.
import type { Scheme } from "../ui";

type CourseColor = { bg: string; fg: string; solid: string };

const LIGHT: CourseColor[] = [
  { bg: "#ffe1e6", fg: "#8a0a24", solid: "#e11d48" },
  { bg: "#dcecff", fg: "#0b4a8f", solid: "#3b82f6" },
  { bg: "#e3f5e1", fg: "#1f6b2a", solid: "#22a35a" },
  { bg: "#fff0d1", fg: "#7a4a00", solid: "#f59e0b" },
  { bg: "#efe4ff", fg: "#5b2a9e", solid: "#8b5cf6" },
  { bg: "#d8f3f1", fg: "#0d5e58", solid: "#0d9488" },
  { bg: "#ffe6d9", fg: "#9a3b0a", solid: "#f97316" },
  { bg: "#e6e9f0", fg: "#374151", solid: "#64748b" },
];

const DARK: CourseColor[] = [
  { bg: "#4a1522", fg: "#ffc2cf", solid: "#e11d48" },
  { bg: "#10304f", fg: "#b9d9ff", solid: "#3b82f6" },
  { bg: "#173a1c", fg: "#bfe8b8", solid: "#22a35a" },
  { bg: "#3f2e0b", fg: "#ffd98a", solid: "#f59e0b" },
  { bg: "#301c50", fg: "#dcc6ff", solid: "#8b5cf6" },
  { bg: "#0d3634", fg: "#a6ece6", solid: "#0d9488" },
  { bg: "#47220f", fg: "#ffc9a8", solid: "#f97316" },
  { bg: "#282d38", fg: "#d1d6e0", solid: "#64748b" },
];

export const courseColors = (scheme: Scheme, index: number): CourseColor => (scheme === "dark" ? DARK : LIGHT)[index % 8]!;

import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Nav } from "@/components/Nav";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

// Display face for titles, tile names and big numbers (UI rework, owner 2026-10-05). Self-hosted
// by next/font at build time; body text stays on the system font.
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-plus-jakarta", display: "swap" });

export const metadata: Metadata = {
  title: { default: "TurboTerp", template: "%s · TurboTerp" },
  description:
    "Dining menus, library and gym hours, study rooms and Shuttle-UM buses for UMD students. Unofficial; not affiliated with the University of Maryland.",
  applicationName: "TurboTerp",
  appleWebApp: { capable: true, title: "TurboTerp", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The pre-paint script sets data-theme on <html> before React loads, so the
    // attribute legitimately differs from the server render.
    <html lang="en" className={plusJakarta.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <Nav />
        <div className="app-content">{children}</div>
      </body>
    </html>
  );
}

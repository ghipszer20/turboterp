import type { Metadata, Viewport } from "next";
import { Nav } from "@/components/Nav";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

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
    <html lang="en" suppressHydrationWarning>
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

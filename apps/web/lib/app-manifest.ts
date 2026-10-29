import type { MetadataRoute } from "next";

export const ALERTS_START_URL = "/schedule/alerts";
export const ALERTS_MANIFEST_PATH = "/schedule/alerts/manifest.webmanifest";

/**
 * One web app manifest for the site; only start_url differs per page. scope and id stay "/", so an
 * icon saved from Seat Alerts is the same app and can reach every page without leaving to Safari.
 */
export function buildManifest({ startUrl = "/" }: { startUrl?: string } = {}): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "TurboTerp",
    short_name: "TurboTerp",
    description: "The all-in-one app for UMD students. Unofficial; not affiliated with the University of Maryland.",
    start_url: startUrl,
    scope: "/",
    display: "standalone",
    background_color: "#f5f5f7",
    theme_color: "#ba0c2f",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}

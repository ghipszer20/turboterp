import type { MetadataRoute } from "next";

const SITE_URL = "https://turboterp.com";

// The pages search engines should list (owner, 2026-10-08).
const PATHS = [
  "",
  "/campus",
  "/campus/dining",
  "/campus/dining/search",
  "/campus/gym",
  "/campus/libraries",
  "/campus/rooms",
  "/campus/transport",
  "/schedule",
  "/advisor",
  "/calendar",
  "/about",
  "/support",
  "/donate",
  "/report",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({ url: `${SITE_URL}${path}` }));
}

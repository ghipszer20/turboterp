import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Listed on search engines (owner, 2026-10-08). API routes and the old gate page aren't pages to list.
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/coming-soon"] },
    sitemap: "https://turboterp.com/sitemap.xml",
  };
}

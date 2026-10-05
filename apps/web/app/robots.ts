import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Not ready for the public yet (owner, 2026-10-04): keep search engines out until launch.
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}

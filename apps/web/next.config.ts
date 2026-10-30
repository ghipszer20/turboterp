import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components: data is cached explicitly with 'use cache' + cacheLife,
  // each campus source at its own refresh rate (see lib/campus.ts).
  cacheComponents: true,
  // The shared packages ship TypeScript source; let Next compile them.
  transpilePackages: [
    "@turboterp/campus-data",
    "@turboterp/audit",
    "@turboterp/course-data",
    "@turboterp/credit",
    "@turboterp/plan",
    "@turboterp/programs",
    "@turboterp/catalog",
    "@turboterp/ratings",
    "@turboterp/tracks",
  ],
  // Keep old links working after the tab restructure.
  async redirects() {
    return [
      // Transport (Shuttle-UM) was removed 2026-10-29; Transit covers it better.
      { source: "/campus/transport", destination: "/campus", permanent: false },
      { source: "/campus/buses", destination: "/campus", permanent: false },
      { source: "/campus/transit", destination: "/campus", permanent: false },
      // Seat Alerts moved out of Schedule into its own tab; Calendar was removed (owner, 2026-10-29).
      { source: "/schedule/alerts", destination: "/alerts", permanent: false },
      { source: "/schedule/alerts/:path*", destination: "/alerts/:path*", permanent: false },
      { source: "/calendar", destination: "/", permanent: false },
      { source: "/plan", destination: "/advisor", permanent: true },
      { source: "/explore", destination: "/schedule", permanent: true },
    ];
  },
};

export default nextConfig;

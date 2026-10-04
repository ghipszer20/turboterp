import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TurboTerp",
    short_name: "TurboTerp",
    description: "The all-in-one app for UMD students. Unofficial; not affiliated with the University of Maryland.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f5f7",
    theme_color: "#ba0c2f",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}

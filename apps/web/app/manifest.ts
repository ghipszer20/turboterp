import type { MetadataRoute } from "next";
import { buildManifest } from "@/lib/app-manifest";

export default function manifest(): MetadataRoute.Manifest {
  return buildManifest();
}

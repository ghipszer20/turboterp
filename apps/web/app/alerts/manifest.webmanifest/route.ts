import { ALERTS_START_URL, buildManifest } from "@/lib/app-manifest";

/** Manifest used when the student saves the Seat Alerts page to the Home Screen: the icon opens Seat Alerts. */
export function GET() {
  return Response.json(buildManifest({ startUrl: ALERTS_START_URL }), {
    headers: { "Content-Type": "application/manifest+json" },
  });
}

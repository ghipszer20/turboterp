import type { Metadata } from "next";
import { Page } from "@/components/ui";
import { ALERTS_MANIFEST_PATH } from "@/lib/app-manifest";
import { AlertsApp } from "./AlertsApp";

export const metadata: Metadata = {
  title: "Seat Alerts",
  manifest: ALERTS_MANIFEST_PATH,
  description: "Get a push notification within about a minute of a seat opening in a full UMD class.",
};

export default function AlertsPage() {
  return (
    <Page title="Seat Alerts" subtitle="Schedule">
      <AlertsApp />
    </Page>
  );
}

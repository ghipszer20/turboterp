import type { Metadata } from "next";
import { Page } from "@/components/ui";
import { AlertsApp } from "./AlertsApp";

export const metadata: Metadata = {
  title: "Seat Alerts",
  description: "Get a push notification within about a minute of a seat opening in a full UMD class.",
};

export default function AlertsPage() {
  return (
    <Page title="Schedule" subtitle="Seat Alerts">
      <AlertsApp />
    </Page>
  );
}

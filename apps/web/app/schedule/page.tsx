import type { Metadata } from "next";
import { Suspense } from "react";
import { Page, SkeletonCard } from "@/components/ui";
import { getAcademicCalendar, safe } from "@/lib/campus";
import { ScheduleBuilder } from "./ScheduleBuilder";

export const metadata: Metadata = { title: "Schedule" };

// The builder runs in the browser (schedule generation in a Web Worker) on pre-built,
// CDN-cached course files from /api/schedule, so the server does no per-student work.
export default async function SchedulePage() {
  const calendar = await safe(getAcademicCalendar);
  return (
    <Page title="Schedule" subtitle="Schedule builder">
      <Suspense fallback={<SkeletonCard rows={4} />}>
        <ScheduleBuilder events={calendar.ok ? calendar.data : []} />
      </Suspense>
    </Page>
  );
}

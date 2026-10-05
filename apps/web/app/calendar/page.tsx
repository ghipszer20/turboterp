import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { campusDate } from "@turboterp/campus-data";
import { Notice, Page, SkeletonCard, SourceError } from "@/components/ui";
import { getAcademicCalendar, safe } from "@/lib/campus";
import { dedupeEvents } from "@/lib/calendar";
import { CalendarView } from "./CalendarView";

export const metadata: Metadata = { title: "Calendar" };

export default function CalendarPage() {
  return (
    <Page title="Calendar" subtitle="UMD academic dates">
      <Suspense fallback={<SkeletonCard rows={6} />}>
        <Dates />
      </Suspense>
      <Notice>Dates from the UMD Registrar.</Notice>
    </Page>
  );
}

async function Dates() {
  await connection();
  const today = campusDate();
  const res = await safe(getAcademicCalendar);
  if (!res.ok) return <SourceError source="the UMD Registrar" />;
  return <CalendarView events={dedupeEvents(res.data)} today={today} />;
}

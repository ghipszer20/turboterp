import type { Metadata } from "next";
import { Suspense } from "react";
import { Notice, Page, Section, SkeletonCard, SourceError } from "@/components/ui";
import { ClassesSection } from "./ClassesSection";
import { GymList } from "./GymList";
import { ReserveSection } from "./ReserveSection";
import { getGroupFitness, getRecWellAreas, safe } from "@/lib/campus";

export const metadata: Metadata = { title: "Fitness" };

export default function GymPage() {
  return (
    <Page title="Fitness" subtitle="Campus">
      <Suspense fallback={<SkeletonCard rows={6} />}>
        <Gyms />
      </Suspense>
      <Section title="Classes">
        <Suspense fallback={<SkeletonCard rows={4} />}>
          <Classes />
        </Suspense>
      </Section>
      <Section title="Reserve">
        <ReserveSection />
      </Section>
      <Notice>
        Hours from UMD RecWell. Closures can happen on short notice; check{" "}
        <a href="https://recwell.umd.edu/facility-alerts" target="_blank" rel="noreferrer">
          facility alerts
        </a>
        .
      </Notice>
    </Page>
  );
}

// Both read cached snapshots; today's hours and open/closed are worked out in the browser.
async function Classes() {
  const res = await safe(getGroupFitness);
  if (!res.ok) return <SourceError source="RecWell group fitness" />;
  return <ClassesSection classes={res.data} />;
}

async function Gyms() {
  const res = await safe(getRecWellAreas);
  if (!res.ok) return <SourceError source="RecWell" />;
  return <GymList areas={res.data} />;
}

"use client";

// Today's hero: the next class today from the schedule saved on this device (nothing leaves the
// device), with a leave-by time when the previous class's building is known. With no class left
// it shows the next academic date instead.

import { useEffect, useState } from "react";
import { buildingByCode } from "@turboterp/campus-data/buildings";
import { distanceMeters, walkMinutes } from "@turboterp/campus-data/walk";
import type { Section } from "@turboterp/course-data/schedules";
import { Hero } from "@/components/ui";
import { nextClass } from "@/lib/next-class";
import { loadPickedSections } from "@/lib/schedule/picked-sections";
import { useBuildings } from "@/lib/schedule/use-buildings";

export type UpNext = { title: string; sub: string };

export function NextClassHero({ upNext }: { upNext: UpNext | null }) {
  const buildings = useBuildings();
  const [sections, setSections] = useState<Section[] | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    loadPickedSections()
      .catch(() => null)
      .then((picked) => {
        setNow(new Date());
        setSections(picked);
      });
  }, []);

  const next =
    sections && now
      ? nextClass(sections, now, (from, to) => {
          const a = buildingByCode(buildings, from);
          const b = buildingByCode(buildings, to);
          return a && b ? walkMinutes(distanceMeters(a.lat, a.lon, b.lat, b.lon)) : null;
        })
      : null;

  if (next) {
    const leave = next.leaveBy ? `leave by ${next.leaveBy.replace(/ [AP]M$/, "")}${next.from ? ` from ${next.from}` : ""}` : null;
    const sub = [next.room, leave].filter(Boolean).join(" · ");
    return <Hero label="Next class" title={`${next.courseId} · ${next.start}`} sub={sub} href="/schedule" />;
  }
  if (upNext) return <Hero label="Up next" title={upNext.title} sub={upNext.sub} href="/calendar" />;
  return <Hero label="Next class" title="No class left today" sub="Save a schedule to see your next class here" href="/schedule" />;
}

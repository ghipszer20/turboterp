"use client";

import type { DayHours } from "@turboterp/campus-data/hours";
import { hoursStatus } from "@/lib/status";
import { useCampusMinutes } from "@/lib/useCampusMinutes";
import { StatusPill } from "./ui";

/** An "Open until 9pm" pill that stays correct as time passes. */
export function LiveStatus({
  hours,
  initialMinutes,
  inline = false,
}: {
  hours: DayHours | undefined;
  initialMinutes: number;
  inline?: boolean;
}) {
  const minutes = useCampusMinutes(initialMinutes);
  const { status, text } = hoursStatus(hours, minutes);
  return (
    <StatusPill status={status} inline={inline}>
      {text}
    </StatusPill>
  );
}

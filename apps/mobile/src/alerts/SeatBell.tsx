// The bell in the schedule builder's section panel: watch a full section, or any section of the class.
import { useState } from "react";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { findWatch } from "@turboterp/app-core/seat-alerts/view";
import { Text, tap, useTheme } from "../ui";
import { addErrorText } from "./model";
import { useAlerts } from "./store";
import type { SeatBellSlot } from "../schedule/components/SectionPanel";

function Bell({ courseId, sectionId, full }: { courseId: string; sectionId: string | null; full: boolean }) {
  const { c } = useTheme();
  const router = useRouter();
  const alerts = useAlerts();
  const [error, setError] = useState<string | null>(null);
  if (alerts.phase === "loading" || alerts.phase === "unavailable") return null;
  // A section row only gets a bell while it is full; the course-level bell only while one is.
  if (!full) return null;
  const watch = findWatch(alerts.data.watches, courseId, sectionId);
  const label = sectionId ? "Notify me" : "Alert for all sections";
  const text = error ?? (watch ? "Watching" : label);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!watch }}
      accessibilityLabel={watch ? `Stop watching ${courseId}${sectionId ? ` ${sectionId}` : ""}` : `${label}: ${courseId}${sectionId ? ` ${sectionId}` : ""}`}
      hitSlop={8}
      onPress={async () => {
        tap();
        setError(null);
        if (watch) return void (await alerts.remove(watch.id));
        if (alerts.phase === "needs-setup") {
          if (alerts.availability !== "ready") return void router.push("/seat-alerts");
          if (!(await alerts.enable())) return void router.push("/seat-alerts");
        }
        const problem = await alerts.add(courseId, sectionId);
        if (problem) setError(addErrorText(problem));
      }}
      style={{ minHeight: 44, justifyContent: "center", paddingHorizontal: 8 }}
    >
      <Text variant="foot" style={{ color: watch ? c.text2 : c.accent }} numberOfLines={1}>
        {text}
      </Text>
    </Pressable>
  );
}

export const renderSeatBell: SeatBellSlot = (args) => <Bell key={`${args.courseId}-${args.sectionId ?? "all"}`} {...args} />;

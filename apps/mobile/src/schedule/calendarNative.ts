// The device half of "Add to calendar": write-only Apple Calendar access (iOS 17+) through
// expo-calendar. Permission is asked only here, when the student taps the button. Needs a device.
import * as Calendar from "expo-calendar";
import { Linking } from "react-native";
import { accessDecision, type AppleEvent } from "./calendarExport";

export type AddResult = { status: "added"; count: number } | { status: "denied" | "settings" | "error" };

export async function addToAppleCalendar(events: AppleEvent[]): Promise<AddResult> {
  try {
    const perm = await Calendar.requestCalendarPermissions(true);
    const decision = accessDecision(perm);
    if (decision !== "granted") return { status: decision };
    // With write-only access this is EventKit's virtual calendar: it can create events, not read any.
    const calendar = Calendar.getDefaultCalendarSync();
    for (const e of events) {
      await calendar.createEvent({ ...e, recurrenceRule: { ...e.recurrenceRule, frequency: Calendar.Frequency.WEEKLY } });
    }
    return { status: "added", count: events.length };
  } catch {
    return { status: "error" };
  }
}

export const openSettings = () => Linking.openSettings();

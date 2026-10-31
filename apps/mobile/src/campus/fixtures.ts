// Dev-only sample data so the web export can be screenshotted (it can't reach the API: CORS).
// Switched on with EXPO_PUBLIC_FIXTURES=1; never set in a production build.
import type { DayHours, FitnessClass, LibraryHours, RecWellArea } from "@turboterp/campus-data";
import { addDays } from "@turboterp/campus-data/dates";
import { parseHours } from "@turboterp/campus-data/hours";
import { clockAt } from "@turboterp/app-core/campus-clock";
import type { GymsPayload, RoomsPayload } from "./model";

export const FIXTURES_ON = process.env.EXPO_PUBLIC_FIXTURES === "1";

function week(start: string, label: string): Record<string, DayHours> {
  const days: Record<string, DayHours> = {};
  for (let i = 0; i < 14; i++) days[addDays(start, i)] = parseHours(label);
  return days;
}

export function fixtureLibraries(): LibraryHours[] {
  const { today } = clockAt(new Date());
  const lib = (id: number, name: string, label: string, kind: "library" | "department" = "library"): LibraryHours => ({
    id,
    name,
    kind,
    url: "https://umd.libcal.com/hours",
    days: week(today, label),
  });
  return [
    lib(1, "Hornbake Library", "8am - 10pm"),
    lib(2, "McKeldin Library", "24 Hours"),
    lib(3, "STEM Library", "9am - 9pm"),
    lib(4, "Michelle Smith Performing Arts Library", "10am - 6pm"),
    lib(5, "Special Collections", "10am - 5pm", "department"),
  ];
}

const stamp = (date: string, minutes: number) =>
  `${date} ${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:00`;

export function fixtureRooms(): RoomsPayload {
  const { today } = clockAt(new Date());
  const open = (...windows: [number, number][]) =>
    windows.map(([a, b]) => ({ start: stamp(today, a), end: stamp(today, b) }));
  return {
    catalog: {
      locations: [
        { id: 1, name: "McKeldin Library" },
        { id: 2, name: "STEM Library" },
      ],
    },
    rooms: [
      { id: 86389, name: "Room 2100A", capacity: 6, locationId: 1, categoryName: "McKeldin Group Study Rooms", open: open([0, 1440]) },
      { id: 86390, name: "Room 2100B", capacity: 4, locationId: 1, categoryName: "McKeldin Group Study Rooms", open: open([600, 720], [840, 1020]) },
      { id: 86391, name: "Room 6107", capacity: 2, locationId: 1, categoryName: "McKeldin Group Study Rooms", open: open([780, 840]) },
      { id: 90001, name: "Room 3201", capacity: 8, locationId: 2, categoryName: "STEM Group Study Rooms", open: open([540, 660], [900, 1260]) },
    ],
    failed: 0,
    updatedAt: new Date(Date.now() - 12 * 60_000).toISOString(),
  };
}

export function fixtureGyms(): GymsPayload {
  const { today } = clockAt(new Date());
  const area = (group: string, name: string, label: string): RecWellArea => ({
    group,
    name,
    url: "https://recwell.umd.edu",
    setting: "indoor",
    hoursByDate: Object.fromEntries(Array.from({ length: 3 }, (_, i) => [addDays(today, i), label])),
  });
  const cls = (day: string, name: string, start: number, location: string, instructor: string): FitnessClass => ({
    day,
    name,
    location,
    instructor,
    start,
    end: start + 50,
    signupUrl: "https://activeterp.umd.edu/",
  });
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = days[new Date(`${today}T12:00:00Z`).getUTCDay()]!;
  return {
    areas: {
      ok: true,
      data: [
        area("Eppley Recreation Center", "Eppley Recreation Center", "6am - 11pm"),
        area("Eppley Recreation Center", "Bouldering Zone", "3pm - 9pm"),
        area("Ritchie Coliseum", "Ritchie Coliseum", "7am - 9pm"),
        area("School of Public Health", "Fitness Center", "6am - 10pm"),
      ],
    },
    classes: {
      ok: true,
      data: [
        cls(todayName, "Power Yoga", 17 * 60, "ERC Studio 1", "Sam"),
        cls(todayName, "Cycle Strength", 18 * 60, "ERC Cycle Studio", "Alex"),
        cls(todayName, "Zumba", 19 * 60, "Ritchie Studio", "Mia"),
      ],
    },
  };
}

// Live check: runs every source against the real sites once and prints a
// summary. Run by hand (`npm run smoke`), never in CI. Keeps request counts
// small: one date, one room category.

import {
  addDays,
  campusDate,
  DINING_HALLS,
  fetchCategoryAvailability,
  fetchDiningMenu,
  fetchLibraryHours,
  fetchRecWellAreas,
  fetchRoomCatalog,
  recWellOnDate,
} from "../src/index.ts";

const today = campusDate();
let failures = 0;

async function check(name: string, run: () => Promise<string>) {
  const t = performance.now();
  try {
    const summary = await run();
    console.log(`✓ ${name.padEnd(10)} ${summary} (${Math.round(performance.now() - t)} ms)`);
  } catch (err) {
    failures++;
    console.log(`✗ ${name.padEnd(10)} ${(err as Error).message}`);
  }
}

await check("recwell", async () => {
  const areas = await fetchRecWellAreas();
  const todays = recWellOnDate(areas, today);
  const open = todays.filter((a) => a.hours.kind !== "closed").length;
  return `${areas.length} areas, ${todays.length} listed today, ${open} with hours`;
});

await check("libraries", async () => {
  const libs = await fetchLibraryHours(1);
  const mck = libs.find((l) => l.name.startsWith("McKeldin"));
  return `${libs.length} locations; McKeldin today: ${mck?.days[today]?.label ?? "n/a"}`;
});

await check("dining", async () => {
  const menus = await Promise.all(DINING_HALLS.map((h) => fetchDiningMenu(h.id, today)));
  return menus
    .map((m, i) => {
      const items = m.meals.reduce((n, meal) => n + meal.stations.reduce((k, s) => k + s.items.length, 0), 0);
      return `${DINING_HALLS[i]!.short}: ${m.meals.length} meals/${items} items`;
    })
    .join("; ");
});

await check("rooms", async () => {
  const { locations, rooms } = await fetchRoomCatalog();
  const first = rooms[0]!;
  const avail = await fetchCategoryAvailability(rooms, first.locationId, first.categoryId, today, addDays(today, 1));
  const withOpen = avail.filter((r) => r.open.length > 0).length;
  return `${locations.length} libraries, ${rooms.length} rooms; "${first.categoryName}": ${withOpen}/${avail.length} have open time today`;
});

process.exitCode = failures > 0 ? 1 : 0;

// Cache tags for the campus snapshots. Pages read snapshots through "use cache" functions tagged
// here; the refresh job revalidates the tags of the snapshot keys it wrote.

export type CampusTag = "campus:rooms" | "campus:dining" | "campus:hours" | "campus:recwell" | "campus:calendar";

/** The cache tag of a snapshot key (`rooms/...`, `dining/...`, `libraries/...`, `recwell/...`, `calendar/...`), or null. */
export function campusTagForKey(key: string): CampusTag | null {
  if (key.startsWith("rooms/")) return "campus:rooms";
  if (key.startsWith("dining/")) return "campus:dining";
  if (key.startsWith("libraries/")) return "campus:hours";
  if (key.startsWith("recwell/")) return "campus:recwell";
  if (key.startsWith("calendar/")) return "campus:calendar";
  return null;
}

/** Distinct tags for the keys that were written. */
export function campusTagsForKeys(keys: string[]): CampusTag[] {
  return [...new Set(keys.flatMap((k) => campusTagForKey(k) ?? []))];
}

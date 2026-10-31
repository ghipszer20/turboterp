
/** "updated 4 min ago": how old a snapshot is, for pages that mention freshness. */
export function dataAge(updatedAt: string, now: Date): string {
  const minutes = Math.floor((now.getTime() - Date.parse(updatedAt)) / 60_000);
  if (minutes < 1) return "updated just now";
  if (minutes < 60) return `updated ${minutes} min ago`;
  return `updated ${Math.floor(minutes / 60)} hr ago`;
}

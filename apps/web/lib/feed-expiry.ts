// The Shuttle-UM GTFS feed carries an end date (feed_info.txt). Past it, the schedule shows no
// service, so Transport warns ahead of time and after. Pure; the page passes the campus date.

const WARN_DAYS = 30;

const dayNumber = (iso: string) => Date.parse(`${iso}T00:00:00Z`) / 86_400_000;

const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" });

export function feedExpiryNotice(validUntil: string | null, today: string): string | null {
  if (!validUntil) return null;
  const daysLeft = dayNumber(validUntil) - dayNumber(today);
  if (daysLeft < 0) {
    return `Shuttle-UM's published schedule ended ${formatDate(validUntil)}, so these times may be wrong or missing. Check Transit for live buses.`;
  }
  if (daysLeft <= WARN_DAYS) {
    return `Shuttle-UM's published schedule runs through ${formatDate(validUntil)}. TurboTerp switches to the next one once it's out.`;
  }
  return null;
}

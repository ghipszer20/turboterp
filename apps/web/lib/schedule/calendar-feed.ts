// "Add to calendar": the feed URL for a set of picked sections, which calendar app link to open,
// and parsing/validation of the feed route's query. Pure.

import { termDates } from "./term-dates";

export type FeedPair = { courseId: string; sectionId: string };

export const MAX_FEED_PAIRS = 12;
const FEED_ROUTE = "/api/calendar/schedule.ics";
const COURSE_ID = /^[A-Z]{4}\d{3}[A-Z]{0,2}$/;
const SECTION_ID = /^[A-Za-z0-9]{1,8}$/;

export type DeviceInfo = { userAgent: string; platform?: string; maxTouchPoints?: number };

/** iPhone, iPad (including iPadOS posing as a Mac, which has touch) and Mac: all open webcal:// in Apple Calendar. */
export function isAppleDevice({ userAgent, platform = "", maxTouchPoints = 0 }: DeviceInfo): boolean {
  if (/iPhone|iPad|iPod/.test(userAgent) || /iPhone|iPad|iPod/.test(platform)) return true;
  if (maxTouchPoints > 1 && /Mac/.test(platform || userAgent)) return true;
  return /Macintosh|Mac OS X/.test(userAgent) || /^Mac/.test(platform);
}

export function feedPath(term: string, pairs: readonly FeedPair[]): string {
  return `${FEED_ROUTE}?term=${term}&s=${pairs.map((p) => `${p.courseId}-${p.sectionId}`).join(",")}`;
}

/** Apple: the webcal:// feed (Apple Calendar's subscribe prompt). Everyone else: Google Calendar's add-by-URL link. */
export function addToCalendarUrl(o: { host: string; term: string; pairs: readonly FeedPair[]; apple: boolean }): string {
  const feed = `webcal://${o.host}${feedPath(o.term, o.pairs)}`;
  return o.apple ? feed : `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(feed)}`;
}

export type FeedQuery = { ok: true; term: string; pairs: FeedPair[] } | { ok: false; error: string };

export function parseFeedQuery(term: string | null, s: string | null): FeedQuery {
  if (!term || !/^\d{6}$/.test(term) || !termDates(term)) return { ok: false, error: "Unknown term" };
  if (!s) return { ok: false, error: "No sections given" };
  const raw = s.split(",");
  if (raw.length > MAX_FEED_PAIRS) return { ok: false, error: `At most ${MAX_FEED_PAIRS} sections` };
  const pairs: FeedPair[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const [courseId, sectionId, ...rest] = item.split("-");
    if (rest.length || !courseId || !sectionId || !COURSE_ID.test(courseId) || !SECTION_ID.test(sectionId)) {
      return { ok: false, error: "Malformed section" };
    }
    if (seen.has(item)) continue;
    seen.add(item);
    pairs.push({ courseId, sectionId });
  }
  return { ok: true, term, pairs };
}

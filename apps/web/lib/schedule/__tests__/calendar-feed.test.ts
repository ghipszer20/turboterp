import { describe, expect, it } from "vitest";
import { addToCalendarUrl, feedPath, isAppleDevice, parseFeedQuery } from "../calendar-feed";

describe("isAppleDevice", () => {
  it("is true for iPhone", () => {
    expect(isAppleDevice({ userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", platform: "iPhone", maxTouchPoints: 5 })).toBe(true);
  });
  it("is true for iPad", () => {
    expect(isAppleDevice({ userAgent: "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)", platform: "iPad", maxTouchPoints: 5 })).toBe(true);
  });
  it("is true for iPadOS reporting as a Mac with touch", () => {
    expect(isAppleDevice({ userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", platform: "MacIntel", maxTouchPoints: 5 })).toBe(true);
  });
  it("is true for a Mac", () => {
    expect(isAppleDevice({ userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", platform: "MacIntel", maxTouchPoints: 0 })).toBe(true);
  });
  it("is false for Windows", () => {
    expect(isAppleDevice({ userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", platform: "Win32", maxTouchPoints: 0 })).toBe(false);
  });
  it("is false for Android", () => {
    expect(isAppleDevice({ userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8)", platform: "Linux armv81", maxTouchPoints: 5 })).toBe(false);
  });
  it("works without a platform string", () => {
    expect(isAppleDevice({ userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" })).toBe(true);
  });
});

describe("feedPath", () => {
  it("puts the term and pairs in the query", () => {
    expect(feedPath("202701", [{ courseId: "CMSC131", sectionId: "0202" }, { courseId: "MATH141", sectionId: "0121" }])).toBe(
      "/api/calendar/schedule.ics?term=202701&s=CMSC131-0202,MATH141-0121",
    );
  });
});

describe("addToCalendarUrl", () => {
  const pairs = [{ courseId: "CMSC131", sectionId: "0202" }];
  const feed = "webcal://turboterp.app/api/calendar/schedule.ics?term=202701&s=CMSC131-0202";
  it("gives Apple devices a webcal link", () => {
    expect(addToCalendarUrl({ host: "turboterp.app", term: "202701", pairs, apple: true })).toBe(feed);
  });
  it("gives everyone else Google Calendar's add-by-URL link", () => {
    expect(addToCalendarUrl({ host: "turboterp.app", term: "202701", pairs, apple: false })).toBe(
      `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(feed)}`,
    );
  });
});

describe("parseFeedQuery", () => {
  it("parses a valid query", () => {
    expect(parseFeedQuery("202608", "CMSC131-0202,MATH141-0121")).toEqual({
      ok: true,
      term: "202608",
      pairs: [
        { courseId: "CMSC131", sectionId: "0202" },
        { courseId: "MATH141", sectionId: "0121" },
      ],
    });
  });
  it("accepts honors course ids", () => {
    expect(parseFeedQuery("202608", "ENGL101H-0101").ok).toBe(true);
  });
  it("rejects a missing or unknown term", () => {
    expect(parseFeedQuery(null, "CMSC131-0202").ok).toBe(false);
    expect(parseFeedQuery("199901", "CMSC131-0202").ok).toBe(false);
    expect(parseFeedQuery("abc", "CMSC131-0202").ok).toBe(false);
  });
  it("rejects missing or empty pairs", () => {
    expect(parseFeedQuery("202608", null).ok).toBe(false);
    expect(parseFeedQuery("202608", "").ok).toBe(false);
  });
  it("rejects malformed ids", () => {
    expect(parseFeedQuery("202608", "cmsc131-0202").ok).toBe(false);
    expect(parseFeedQuery("202608", "CMSC131").ok).toBe(false);
    expect(parseFeedQuery("202608", "CMSC131-0202,../x-1").ok).toBe(false);
  });
  it("rejects more than 12 pairs", () => {
    const many = Array.from({ length: 13 }, (_, i) => `CMSC${100 + i}-0101`).join(",");
    expect(parseFeedQuery("202608", many).ok).toBe(false);
  });
  it("drops duplicate pairs", () => {
    const r = parseFeedQuery("202608", "CMSC131-0202,CMSC131-0202");
    expect(r.ok && r.pairs).toHaveLength(1);
  });
});

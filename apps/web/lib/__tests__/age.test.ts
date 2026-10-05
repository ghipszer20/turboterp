import { describe, expect, it } from "vitest";
import { dataAge, seatsAge } from "../age";

const NOW = new Date("2026-09-25T13:00:00.000Z");
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();

describe("dataAge", () => {
  it("says 'just now' under a minute", () => {
    expect(dataAge(ago(40_000), NOW)).toBe("updated just now");
  });

  it("counts whole minutes under an hour", () => {
    expect(dataAge(ago(4 * 60_000 + 59_000), NOW)).toBe("updated 4 min ago");
    expect(dataAge(ago(59 * 60_000), NOW)).toBe("updated 59 min ago");
  });

  it("counts whole hours after that", () => {
    expect(dataAge(ago(60 * 60_000), NOW)).toBe("updated 1 hr ago");
    expect(dataAge(ago(5 * 3600_000 + 50 * 60_000), NOW)).toBe("updated 5 hr ago");
  });

  it("treats a timestamp slightly in the future (clock skew) as just now", () => {
    expect(dataAge(ago(-5_000), NOW)).toBe("updated just now");
  });
});

describe("seatsAge", () => {
  it("prefixes the data age with Seats", () => {
    expect(seatsAge(ago(4 * 60_000), NOW)).toBe("Seats updated 4 min ago");
    expect(seatsAge(ago(1_000), NOW)).toBe("Seats updated just now");
  });
});

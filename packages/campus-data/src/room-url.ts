// Pure (no HTML parser), so the iOS app can import it.

/** A room's own LibCal booking screen, pre-filled to one date. */
export function roomBookingUrl(roomId: number, isoDate: string): string {
  return `https://umd.libcal.com/space/${roomId}?date=${isoDate}`;
}

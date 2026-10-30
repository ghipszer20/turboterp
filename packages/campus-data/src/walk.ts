// Walking estimates between campus points: no routing service, just the straight-line distance
// stretched by a detour factor, always shown to students as an estimate.

/** Great-circle distance in meters. */
export function distanceMeters(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLon = (bLon - aLon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
}

// Owner ruling: "straight-line (haversine) distance x1.3 detour factor at 1.3 m/s". Kept as two
// named constants (rather than folded together) so a change to either -- they aren't meant to
// be the same number, they just are right now -- is a one-line edit, not a re-derivation.
const WALK_DETOUR_FACTOR = 1.3;
const WALK_SPEED_MPS = 1.3;

/** Estimated walking minutes for a straight-line distance, per the owner's detour-factor ruling. */
export function walkMinutes(meters: number): number {
  return (meters * WALK_DETOUR_FACTOR) / WALK_SPEED_MPS / 60;
}

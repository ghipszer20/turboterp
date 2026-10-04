// Bounding the campus map to campus itself (owner ruling, "Transport map v2": "you went
// overkill on the campus map - only need UMD campus"), plus the pure geometry for showing
// where a route's line leaves that box.

import type { LonLat } from "@turboterp/campus-data";

export type CampusBounds = { west: number; south: number; east: number; north: number };

// The campus footprint, not a box drawn around every bus stop. OpenStreetMap's "University of
// Maryland, College Park" relation (osm_type=relation, osm_id=14718558) is a MultiPolygon of 32
// separate parcels -- the main campus plus disjoint outlying university land (the golf course
// north of campus, the M-Square research park across the Beltway, and other small lots). Just
// taking the bounding box of the whole relation sweeps in all of that, plus, incidentally, the
// College Park Metro station a few blocks away. This is instead the bounding box of that
// relation's single largest ring by bbox area (377 vertices; the next-largest, the golf course,
// covers about 55% as much area, and the rest are far smaller) -- the contiguous academic/
// residential/athletic core that's actually "campus" for a student
// walking or riding around it. Computed on 2026-09-26 via:
//   curl "https://nominatim.openstreetmap.org/search?q=University+of+Maryland+College+Park&format=json&polygon_geojson=1&limit=1"
// then taking the bbox of geojson.coordinates[0][0] (the largest of the MultiPolygon's rings).
// A shuttle stop past this line (Route 1 downtown College Park, the Metro, Adelphi Rd) is
// genuinely off campus, not merely off the mall.
export const CAMPUS_BOUNDS: CampusBounds = {
  west: -76.9555028,
  south: 38.9804153,
  east: -76.934508,
  north: 39.0003805,
};

// A floor under how far a student can zoom out, on top of maxBounds itself. maxBounds already
// stops the camera from *panning* past the campus edge, but a sensible minZoom keeps a very
// wide/short viewport from rendering a lot of dead space around a tiny campus box. The campus
// box is roughly 1.8km (E-W) x 2.2km (N-S); it fits within a phone-width map card at about
// zoom 14.3 (with room for the fitBounds padding), so zoom 13 -- one full level looser -- is a
// generous floor rather than a tight one, leaving slack for wider/shorter desktop cards too.
export const CAMPUS_MIN_ZOOM = 13;

/** MapLibre's `LngLatBoundsLike` tuple order: `[[west, south], [east, north]]`. */
export function toMapLibreBounds(bounds: CampusBounds): [[number, number], [number, number]] {
  return [
    [bounds.west, bounds.south],
    [bounds.east, bounds.north],
  ];
}

export function isInCampusBounds([lon, lat]: LonLat, bounds: CampusBounds): boolean {
  return lon >= bounds.west && lon <= bounds.east && lat >= bounds.south && lat <= bounds.north;
}

/** Grows a CampusBounds by `fraction` of each axis's own span, on every side. */
export function expandBounds(bounds: CampusBounds, fraction: number): CampusBounds {
  const padLon = (bounds.east - bounds.west) * fraction;
  const padLat = (bounds.north - bounds.south) * fraction;
  return {
    west: bounds.west - padLon,
    south: bounds.south - padLat,
    east: bounds.east + padLon,
    north: bounds.north + padLat,
  };
}

/** Which side of the box a route's line crossed. */
export type BoundsEdge = "north" | "south" | "east" | "west";

/** Where a route's line crosses out of the campus bounds, and which way it's heading. */
export type RouteExit = {
  lon: number;
  lat: number;
  /** Compass bearing of travel at the crossing: 0 = north, 90 = east, 180 = south, 270 = west. */
  bearingDeg: number;
  edge: BoundsEdge;
  /**
   * The farthest point this line reaches outside the bounds after this crossing, before either
   * the line ends or comes back inside. The crossing point itself is often still right at the
   * campus edge (e.g. a road that's on campus right up to the property line); this is a better
   * anchor for "where does this go" -- closer to the route's actual off-campus destination.
   */
  farthest: LonLat;
};

/**
 * Given a route's shape (its line(s), e.g. one per direction) and the campus bounds, returns
 * every point where the route crosses from inside campus to outside it, with the heading it was
 * travelling at that point. The line coming back onto campus afterwards isn't reported -- only
 * the "it leaves here" crossing is, since that's the one the map needs to mark. A line that
 * never enters the bounds at all (or never leaves them) reports no exits.
 */
export function findRouteExits(lines: LonLat[][], bounds: CampusBounds): RouteExit[] {
  const exits: RouteExit[] = [];
  for (const line of lines) {
    for (let i = 0; i < line.length - 1; i++) {
      const a = line[i]!;
      const b = line[i + 1]!;
      if (!isInCampusBounds(a, bounds) || isInCampusBounds(b, bounds)) continue;

      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      if (dx === 0 && dy === 0) continue;

      // Liang-Barsky-style exit clip: since `a` is inside and `b` is outside, the segment
      // leaves through whichever of the (up to two) relevant box edges it reaches first.
      const candidates: { t: number; edge: BoundsEdge }[] = [];
      if (dx > 0) candidates.push({ t: (bounds.east - a[0]) / dx, edge: "east" });
      else if (dx < 0) candidates.push({ t: (bounds.west - a[0]) / dx, edge: "west" });
      if (dy > 0) candidates.push({ t: (bounds.north - a[1]) / dy, edge: "north" });
      else if (dy < 0) candidates.push({ t: (bounds.south - a[1]) / dy, edge: "south" });

      const winner = candidates.filter((c) => c.t >= 0 && c.t <= 1).reduce((best, c) => (c.t < best.t ? c : best));
      const lon = a[0] + winner.t * dx;
      const lat = a[1] + winner.t * dy;

      // Longitude degrees are narrower than latitude degrees away from the equator; scale by
      // cos(latitude) so the bearing points the right way instead of skewing east/west.
      const scaledDx = dx * Math.cos((a[1] * Math.PI) / 180);
      const bearingDeg = (Math.atan2(scaledDx, dy) * 180) / Math.PI;

      // Walk forward while the line stays outside the bounds, then take the point in that run
      // that's actually farthest from the crossing -- not simply the last one. On an
      // out-and-back excursion (out to a real destination, then partway back before crossing
      // back in) the last point before re-entry can be much closer to campus than the trip's
      // actual far end.
      let runEnd = i + 1;
      while (runEnd + 1 < line.length && !isInCampusBounds(line[runEnd + 1]!, bounds)) runEnd++;
      let farthest = line[i + 1]!;
      let farthestDist = -Infinity;
      for (let j = i + 1; j <= runEnd; j++) {
        const p = line[j]!;
        const dist = (p[0] - lon) ** 2 + (p[1] - lat) ** 2;
        if (dist > farthestDist) {
          farthestDist = dist;
          farthest = p;
        }
      }

      exits.push({ lon, lat, bearingDeg: (bearingDeg + 360) % 360, edge: winner.edge, farthest });
    }
  }
  return exits;
}

/** The nearest of `stops` to `point` that is itself outside the bounds, or null if none is. */
export function nearestOffCampusStop<T extends { lat: number; lon: number }>(
  [lon, lat]: LonLat,
  stops: T[],
  bounds: CampusBounds,
): T | null {
  let best: T | null = null;
  let bestDist = Infinity;
  for (const stop of stops) {
    if (isInCampusBounds([stop.lon, stop.lat], bounds)) continue;
    const dist = (stop.lon - lon) ** 2 + (stop.lat - lat) ** 2;
    if (dist < bestDist) {
      best = stop;
      bestDist = dist;
    }
  }
  return best;
}

/** Strips a trailing GTFS "(Inbound)"/"(Outbound)" direction tag from a stop name, if present. */
export function stripDirectionSuffix(name: string): string {
  return name.replace(/\s*\((?:Inbound|Outbound)\)\s*$/, "");
}

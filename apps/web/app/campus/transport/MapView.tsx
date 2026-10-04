"use client";

// The actual MapLibre map. Only ever loaded client-side, via the dynamic
// import in TransportMap.tsx -- this file (and maplibre-gl itself) must
// never be imported from a Server Component.

import { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap, Marker, NavigationControl, setWorkerUrl } from "maplibre-gl";
import type { GeoJSONSource, MapGeoJSONFeature, MapMouseEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { formatMinutes } from "@turboterp/campus-data/hours";
import type { Itinerary, Place } from "@turboterp/campus-data";
import { LocationIcon } from "@/components/icons";
import { Card, EmptyState } from "@/components/ui";
import {
  CAMPUS_BOUNDS,
  CAMPUS_MIN_ZOOM,
  expandBounds,
  findRouteExits,
  isInCampusBounds,
  nearestOffCampusStop,
  stripDirectionSuffix,
  toMapLibreBounds,
  type BoundsEdge,
} from "@/lib/mapBounds";
import type { MapRoute, MapStop } from "./TransportMap";
import type { PickMode } from "./TripPlanner";
import busStyles from "./buses.module.css";
import styles from "./map.module.css";

// maplibre-gl's worker script itself imports a sibling "./maplibre-gl-shared.mjs".
// Next only ever sees the worker file as an opaque static asset (it isn't
// re-bundled), so that relative import breaks once Next serves it under a
// hashed chunk name -- the worker fails to load and every vector tile and
// GeoJSON source (routes, stops) silently never renders; only the style's
// flat background color shows. scripts/copy-maplibre-worker.mjs (run by
// `npm install`'s postinstall) copies the worker together with that sibling
// file, both under their original names, to public/vendor/ instead.
setWorkerUrl("/vendor/maplibre-gl-worker.mjs");

const LIGHT_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const DARK_STYLE = "https://tiles.openfreemap.org/styles/dark";

const DEFAULT_STOP_COLOR = "#6e6e73";
const HERE_COLOR = "#0a84ff";
const FROM_COLOR = "#34c759";
const TO_COLOR = "#bf0c2f";
const WALK_LINE_COLOR = "#6e6e73";

/**
 * A selected itinerary's legs as GeoJSON lines: walk legs are a straight-line estimate (dashed,
 * neutral gray -- they're the haversine x1.3 estimate, not a routed path), bus legs a straight
 * line between the board and alight stop in the route's own color (solid). Simple, honest lines
 * rather than tracing the road, which the planner doesn't know either.
 */
function itineraryToGeoJson(itinerary: Itinerary | null): GeoJSON.FeatureCollection<GeoJSON.LineString, { color: string; dashed: boolean }> {
  const features: GeoJSON.Feature<GeoJSON.LineString, { color: string; dashed: boolean }>[] =
    itinerary?.legs.map((leg) =>
      leg.kind === "walk"
        ? {
            type: "Feature",
            geometry: { type: "LineString", coordinates: [[leg.from.lon, leg.from.lat], [leg.to.lon, leg.to.lat]] },
            properties: { color: WALK_LINE_COLOR, dashed: true },
          }
        : {
            type: "Feature",
            geometry: { type: "LineString", coordinates: [[leg.boardLon, leg.boardLat], [leg.alightLon, leg.alightLat]] },
            properties: { color: leg.route.color, dashed: false },
          },
    ) ?? [];
  return { type: "FeatureCollection", features };
}

// How far past what's actually shown on load a student can still pan/zoom out (see the maxBounds
// comment below for why this is computed from the fitted view rather than being CAMPUS_BOUNDS
// itself).
const MAX_BOUNDS_SLACK = 0.15;

// Anchor an exit marker so its arrow+label sit *inward* from the edge it's on, instead of
// straddling the boundary (and, on the east/west edges, running back off the visible map).
const EDGE_ANCHOR = { north: "top", south: "bottom", east: "right", west: "left" } as const satisfies Record<
  BoundsEdge,
  string
>;

type Departure = {
  tripId: string;
  route: string;
  routeName: string;
  color: string;
  textColor: string;
  headsign: string;
  minutes: number;
};
type Board = { stopId: string; departures: Departure[] }[];

function currentTheme(): "light" | "dark" {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function casingColor(): string {
  return currentTheme() === "dark" ? "#000000" : "#ffffff";
}

// A small east-pointing chevron, registered as an SDF image (map.addImage(..., { sdf: true })
// below) so it can be recolored per route via icon-color/icon-halo-color like a normal paint
// property, the same way the route line itself is. Drawn pointing east/right specifically
// because that's the reference direction "icon-rotation-alignment: map" rotates *from*: with
// symbol-placement: "line", MapLibre then turns it to match each line segment's actual bearing,
// in the order the GTFS shape's points come in -- i.e. the real direction of travel, not just
// "whichever way reads upright" (icon-keep-upright: false, set on the layer, turns that off).
function createArrowIcon(): ImageData {
  const size = 20;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.moveTo(4, 3);
  ctx.lineTo(17, 10);
  ctx.lineTo(4, 17);
  ctx.lineTo(8, 10);
  ctx.closePath();
  ctx.fill();
  return ctx.getImageData(0, 0, size, size);
}

// Paints the selected route's line(s) and the stops it serves; "no route
// selected" is its own case (routeId "" never matches a real route, so
// nothing is highlighted). Called both right after the style loads --
// otherwise a theme switch mid-selection would reset to "no route" until
// the student clicked a chip again -- and whenever the selection changes.
function applyHighlight(map: MapLibreMap, selectedRoute: string | null, routes: MapRoute[]): void {
  map.setFilter("routes-casing", ["==", ["get", "routeId"], selectedRoute ?? ""]);
  map.setFilter("routes-line", ["==", ["get", "routeId"], selectedRoute ?? ""]);
  map.setFilter("routes-arrows-casing", ["==", ["get", "routeId"], selectedRoute ?? ""]);
  map.setFilter("routes-arrows", ["==", ["get", "routeId"], selectedRoute ?? ""]);
  const route = routes.find((r) => r.id === selectedRoute);
  map.setPaintProperty("routes-line", "line-color", route ? route.color : "#6e6e73");
  map.setPaintProperty("routes-arrows", "icon-color", route ? route.color : "#6e6e73");
  map.setPaintProperty(
    "stops-circle",
    "circle-color",
    selectedRoute
      ? ["case", ["in", selectedRoute, ["get", "routeIds"]], route?.color ?? DEFAULT_STOP_COLOR, DEFAULT_STOP_COLOR]
      : DEFAULT_STOP_COLOR,
  );
  map.setPaintProperty(
    "stops-circle",
    "circle-radius",
    selectedRoute ? ["case", ["in", selectedRoute, ["get", "routeIds"]], 7, 4] : 5,
  );
}

// Where the selected route's line leaves campus, a marker stands in for the stops beyond it
// (which aren't drawn -- see the campus-bounds ruling). Only the selected route gets markers,
// since it's the only route whose line is ever drawn (see applyHighlight's filter above).
function updateExitMarkers(
  map: MapLibreMap,
  markersRef: { current: Marker[] },
  selectedRoute: string | null,
  routes: MapRoute[],
  stops: MapStop[],
): void {
  for (const marker of markersRef.current) marker.remove();
  markersRef.current = [];

  const route = routes.find((r) => r.id === selectedRoute);
  if (!route) return;

  const routeStops = stops.filter((s) => route.stopIds.includes(s.id));
  for (const exit of findRouteExits(route.lines, CAMPUS_BOUNDS)) {
    // The farthest point of the excursion, not the crossing itself, is the better stand-in for
    // "where this goes" -- the crossing is often still right at the campus edge.
    const nearest = nearestOffCampusStop(exit.farthest, routeStops, CAMPUS_BOUNDS);
    const destination = nearest ? stripDirectionSuffix(nearest.name) : route.longName;

    const el = document.createElement("div");
    el.className = styles.exitMarker;
    el.dataset.edge = exit.edge;
    const arrow = document.createElement("span");
    arrow.className = styles.exitArrow;
    arrow.style.background = route.color;
    arrow.style.transform = `rotate(${exit.bearingDeg}deg)`;
    const label = document.createElement("span");
    label.className = styles.exitLabel;
    label.style.background = route.color;
    label.style.color = route.textColor;
    label.textContent = `To ${destination}`;
    el.append(arrow, label);

    markersRef.current.push(
      new Marker({ element: el, anchor: EDGE_ANCHOR[exit.edge] }).setLngLat([exit.lon, exit.lat]).addTo(map),
    );
  }
}

function hasWebGl(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function MapView({
  routes,
  stops,
  stopRoutes,
  pickMode = null,
  onMapPick,
  from = null,
  to = null,
  itinerary = null,
}: {
  routes: MapRoute[];
  stops: MapStop[];
  stopRoutes: Record<string, string[]>;
  /** When set, the next map tap sets this trip-planner field instead of opening a stop card. */
  pickMode?: PickMode;
  onMapPick?: (place: Place) => void;
  /** The trip planner's current endpoints, shown as markers. */
  from?: Place | null;
  to?: Place | null;
  /** The itinerary to draw: walk legs dashed, bus legs in their route color. */
  itinerary?: Itinerary | null;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const hereMarkerRef = useRef<Marker | null>(null);
  const exitMarkersRef = useRef<Marker[]>([]);
  const fromMarkerRef = useRef<Marker | null>(null);
  const toMarkerRef = useRef<Marker | null>(null);
  const [unsupported] = useState(() => !hasWebGl());
  const [failed, setFailed] = useState(false);
  const [themeTick, setThemeTick] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [selectedStop, setSelectedStop] = useState<string | null>(null);
  const [board, setBoard] = useState<{ stopId: string; data: Board } | null>(null);
  const [here, setHere] = useState<{ lat: number; lon: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  // Read from the "load" handler's persistent closures (registered once per map instance, see
  // the effect below), which would otherwise capture whatever pickMode/onMapPick were on the
  // very first render.
  const pickModeRef = useRef(pickMode);
  const onMapPickRef = useRef(onMapPick);
  useEffect(() => {
    pickModeRef.current = pickMode;
    onMapPickRef.current = onMapPick;
  }, [pickMode, onMapPick]);

  // The student's Light/Dark choice can change after the map is up; rebuild it
  // with the matching basemap when it does.
  useEffect(() => {
    const html = document.documentElement;
    const observer = new MutationObserver(() => setThemeTick((n) => n + 1));
    observer.observe(html, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (unsupported || !containerRef.current) return;
    let map: MapLibreMap;
    try {
      map = new MapLibreMap({
        container: containerRef.current,
        style: currentTheme() === "dark" ? DARK_STYLE : LIGHT_STYLE,
        // Campus only (owner ruling): fit the initial view to campus -- maxBounds is set below,
        // once this fit has actually happened, not here (see the comment on that call for why).
        bounds: toMapLibreBounds(CAMPUS_BOUNDS),
        fitBoundsOptions: { padding: 20 },
        minZoom: CAMPUS_MIN_ZOOM,
        // No tilt or rotation (owner ruling): a flat map isn't a shortcoming to fix.
        maxPitch: 0,
        dragRotate: false,
        touchPitch: false,
        // The attribution stays visible, not collapsed to a click-to-reveal icon (see the CSS
        // for how it's kept compact instead).
        attributionControl: { compact: false },
      });
    } catch {
      // Deferred: react-hooks/set-state-in-effect flags a setState call made
      // synchronously as the effect runs; this rare construction failure
      // (e.g. WebGL context lost between the hasWebGl() check and here) is
      // reported a tick later instead.
      queueMicrotask(() => setFailed(true));
      return;
    }
    mapRef.current = map;
    // touchPitch/dragRotate above cover mouse-drag and two-finger-drag pitch; the remaining
    // rotate gesture is pinch-rotate, part of the combined touchZoomRotate handler, which has
    // to stay enabled for pinch-*zoom*. Its own disableRotation() turns off just the rotate half.
    // keyboard.disableRotation() covers the last one: Shift+Left/Right normally rotates too.
    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();
    // MapLibre logs uncaught errors to console.error unless something listens.
    map.on("error", (e) => console.warn("[transport map]", e.error?.message ?? e));
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      // maxBounds wasn't set in the constructor above because MapLibre enforces it as a "cover"
      // constraint: it won't let the camera zoom out past the level where the bounds fill the
      // *whole* viewport, which is a tighter zoom than "the whole box is visible" (a "contain"
      // fit) whenever the box's aspect ratio doesn't match the map card's -- exactly the case
      // here (the campus box is taller than it is wide; the card is wider than it is tall).
      // Passing the same bounds to both `bounds` and `maxBounds` at once made maxBounds win,
      // so the initial view came out zoomed in and cropped rather than fitting all of campus.
      // Setting maxBounds *after* the initial fit instead, from the bounds that fit actually
      // produced, means the pan/zoom-out limit always matches what's really on screen for this
      // card's shape -- with a bit of slack so scrolling out a little is still possible.
      const fitted = map.getBounds();
      const fittedCampusBounds = { west: fitted.getWest(), south: fitted.getSouth(), east: fitted.getEast(), north: fitted.getNorth() };
      map.setMaxBounds(toMapLibreBounds(expandBounds(fittedCampusBounds, MAX_BOUNDS_SLACK)));

      map.addSource("routes", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: routes.flatMap((r) =>
            r.lines.map((line) => ({
              type: "Feature" as const,
              geometry: { type: "LineString" as const, coordinates: line },
              properties: { routeId: r.id },
            })),
          ),
        },
      });
      map.addLayer({
        id: "routes-casing",
        type: "line",
        source: "routes",
        filter: ["==", ["get", "routeId"], ""],
        paint: { "line-color": casingColor(), "line-width": 7, "line-opacity": 0.9 },
      });
      map.addLayer({
        id: "routes-line",
        type: "line",
        source: "routes",
        filter: ["==", ["get", "routeId"], ""],
        paint: { "line-color": "#6e6e73", "line-width": 4 },
      });

      // Direction-of-travel arrows along the route line (owner request): repeated along the
      // line at a fixed spacing, each one rotated to the line's actual bearing at that point --
      // see createArrowIcon's comment for how that rotation-from-shape-order works. The halo
      // (casingColor(), same as the line's own casing) is what keeps them visible against both
      // the light and dark basemap styles -- as a second, larger, casing-colored icon layer
      // underneath the colored one (icon-halo-* needs the image to actually be a distance
      // field to feather properly; this plain filled shape isn't one, so icon-color recolor,
      // the same mechanism routes-casing/routes-line already rely on, is what's used instead).
      map.addImage("route-arrow", createArrowIcon(), { sdf: true });
      const arrowLayout = {
        "icon-image": "route-arrow",
        "symbol-placement": "line",
        "symbol-spacing": 70,
        "icon-rotation-alignment": "map",
        "icon-pitch-alignment": "map",
        "icon-keep-upright": false,
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      } as const;
      map.addLayer({
        id: "routes-arrows-casing",
        type: "symbol",
        source: "routes",
        filter: ["==", ["get", "routeId"], ""],
        layout: { ...arrowLayout, "icon-size": 1.3 },
        paint: { "icon-color": casingColor() },
      });
      map.addLayer({
        id: "routes-arrows",
        type: "symbol",
        source: "routes",
        filter: ["==", ["get", "routeId"], ""],
        layout: { ...arrowLayout, "icon-size": 0.9 },
        paint: { "icon-color": "#6e6e73" },
      });

      map.addSource("stops", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          // Off-campus stops aren't drawn as dots (the exit marker stands in for them); the
          // stop list/departures below the map is unaffected -- it's built from the full list.
          features: stops
            .filter((s) => isInCampusBounds([s.lon, s.lat], CAMPUS_BOUNDS))
            .map((s) => ({
              type: "Feature" as const,
              geometry: { type: "Point" as const, coordinates: [s.lon, s.lat] },
              properties: { id: s.id, name: s.name, routeIds: stopRoutes[s.id] ?? [] },
            })),
        },
      });
      map.addLayer({
        id: "stops-circle",
        type: "circle",
        source: "stops",
        paint: {
          "circle-radius": 5,
          "circle-color": DEFAULT_STOP_COLOR,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#ffffff",
        },
      });
      // The trip planner's selected itinerary: a dashed line per walk leg, a solid one per bus
      // leg in that route's color. Empty at first paint; the effect below fills it in once a
      // trip is planned (and re-fills it here after a theme rebuild).
      map.addSource("trip-plan", { type: "geojson", data: itineraryToGeoJson(itinerary) });
      map.addLayer({
        id: "trip-plan-line",
        type: "line",
        source: "trip-plan",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": ["get", "color"],
          "line-width": 4,
          "line-dasharray": ["case", ["get", "dashed"], ["literal", [0.2, 1.6]], ["literal", [1, 0]]],
        },
      });

      // Re-apply the current selection: on a theme switch this is a rebuilt
      // map with a selection already in React state but none of it painted
      // yet.
      applyHighlight(map, selectedRoute, routes);
      updateExitMarkers(map, exitMarkersRef, selectedRoute, routes, stops);

      const onClick = (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
        const feature = e.features?.[0];
        const id = feature?.properties?.id;
        if (pickModeRef.current && typeof id === "string" && typeof feature?.properties?.name === "string") {
          const [lon, lat] = (feature.geometry as GeoJSON.Point).coordinates;
          onMapPickRef.current?.({ lat: lat!, lon: lon!, label: feature.properties.name });
          return;
        }
        if (typeof id === "string") setSelectedStop(id);
      };
      map.on("click", "stops-circle", onClick);
      map.on("mouseenter", "stops-circle", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "stops-circle", () => (map.getCanvas().style.cursor = pickModeRef.current ? "crosshair" : ""));

      // Tapping anywhere else while picking a trip-planner endpoint sets a custom point there
      // (queried against stops-circle first, so a tap on an actual stop is handled above instead).
      map.on("click", (e: MapMouseEvent) => {
        if (!pickModeRef.current) return;
        const onStop = map.queryRenderedFeatures(e.point, { layers: ["stops-circle"] }).length > 0;
        if (onStop) return;
        onMapPickRef.current?.({ lat: e.lngLat.lat, lon: e.lngLat.lng, label: "Custom point" });
      });
    });

    return () => {
      // Both marker kinds below were added to *this* map; drop them (and the stale refs)
      // before it's destroyed, instead of leaving a marker with no map underneath it.
      for (const marker of exitMarkersRef.current) marker.remove();
      exitMarkersRef.current = [];
      map.remove();
      mapRef.current = null;
      hereMarkerRef.current = null;
      fromMarkerRef.current = null;
      toMarkerRef.current = null;
    };
    // Rebuilding on themeTick swaps the basemap for Light/Dark; routes/stops/stopRoutes
    // come from a server fetch for "today" and don't change while this page is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeTick, unsupported]);

  // Highlight the selected route's line(s) and the stops it serves, and mark where that route's
  // line leaves campus, if it does. (A theme switch is also handled: both run again once the
  // rebuilt map's style has loaded, in the effect above.)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer("routes-line")) return;
    applyHighlight(map, selectedRoute, routes);
    updateExitMarkers(map, exitMarkersRef, selectedRoute, routes, stops);
  }, [selectedRoute, routes, stops]);

  // Fetch scheduled departures for the tapped stop. `board` is tagged with
  // the stop it was fetched for, so switching stops (or closing the card)
  // shows "Loading..." from the render-time check below rather than a
  // setState call at the top of the effect (avoids a same-tick re-render).
  useEffect(() => {
    if (!selectedStop) return;
    let cancelled = false;
    fetch(`/api/buses/departures?stops=${encodeURIComponent(selectedStop)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json: { departures: Board }) => {
        if (!cancelled) setBoard({ stopId: selectedStop, data: json.departures });
      })
      .catch(() => {
        if (!cancelled) setBoard({ stopId: selectedStop, data: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [selectedStop]);

  // "Near me" is opt-in: nothing is requested until the student taps this.
  function locate() {
    if (!("geolocation" in navigator)) {
      setLocError("Location isn't available in this browser.");
      return;
    }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setHere({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocError("Couldn't get your location.");
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  }

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !here) return;
    if (!hereMarkerRef.current) {
      hereMarkerRef.current = new Marker({ color: HERE_COLOR }).setLngLat([here.lon, here.lat]).addTo(map);
    } else {
      hereMarkerRef.current.setLngLat([here.lon, here.lat]);
    }
    map.flyTo({ center: [here.lon, here.lat], zoom: 16 });
  }, [here, themeTick]);

  // The trip planner's From/To markers -- created, moved, or removed as those fields change
  // (and re-created after a theme rebuild, the same way hereMarkerRef is).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (from) {
      if (!fromMarkerRef.current) fromMarkerRef.current = new Marker({ color: FROM_COLOR }).setLngLat([from.lon, from.lat]).addTo(map);
      else fromMarkerRef.current.setLngLat([from.lon, from.lat]);
    } else {
      fromMarkerRef.current?.remove();
      fromMarkerRef.current = null;
    }
  }, [from, themeTick]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (to) {
      if (!toMarkerRef.current) toMarkerRef.current = new Marker({ color: TO_COLOR }).setLngLat([to.lon, to.lat]).addTo(map);
      else toMarkerRef.current.setLngLat([to.lon, to.lat]);
    } else {
      toMarkerRef.current?.remove();
      toMarkerRef.current = null;
    }
  }, [to, themeTick]);

  // The selected itinerary's line(s) (also re-painted after a theme rebuild, in the "load"
  // handler above, which seeds the source from the current `itinerary` prop).
  useEffect(() => {
    const map = mapRef.current;
    const source = map?.getSource("trip-plan") as GeoJSONSource | undefined;
    if (!source) return;
    source.setData(itineraryToGeoJson(itinerary));
  }, [itinerary, themeTick]);

  // A crosshair while picking a From/To point on the map; mouseenter/leave on stops-circle
  // (above) keep the pointer cursor working over an actual stop while picking.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.getCanvas().style.cursor = pickMode ? "crosshair" : "";
  }, [pickMode, themeTick]);

  const stop = stops.find((s) => s.id === selectedStop);
  // null while no stop is selected, or while `board` still holds the
  // previous stop's departures and the new fetch hasn't landed yet.
  const activeBoard = selectedStop && board?.stopId === selectedStop ? board.data : null;
  const servingRoutes = selectedStop
    ? (stopRoutes[selectedStop] ?? []).map((id) => routes.find((r) => r.id === id)).filter((r): r is MapRoute => Boolean(r))
    : [];

  if (unsupported || failed) {
    return (
      <Card className={styles.mapCard}>
        <EmptyState title="Map unavailable">
          This browser can&apos;t show the campus map. Use the stop search below to find departures.
        </EmptyState>
      </Card>
    );
  }

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.routePicker} role="group" aria-label="Choose a route to show on the map">
          <button
            type="button"
            className={styles.routeChip}
            data-selected={selectedRoute === null || undefined}
            onClick={() => setSelectedRoute(null)}
          >
            All stops
          </button>
          {routes.map((r) => (
            <button
              key={r.id}
              type="button"
              className={styles.routeChip}
              data-selected={selectedRoute === r.id || undefined}
              style={selectedRoute === r.id ? { background: r.color, color: r.textColor, borderColor: r.color } : undefined}
              onClick={() => setSelectedRoute((cur) => (cur === r.id ? null : r.id))}
            >
              {r.shortName}
            </button>
          ))}
        </div>
        <button type="button" className={styles.locate} onClick={locate} disabled={locating}>
          <LocationIcon />
          {locating ? "Locating…" : here ? "Update location" : "Show my location"}
        </button>
      </div>
      {locError ? <p className={styles.hint}>{locError}</p> : null}

      <Card className={styles.mapCard}>
        <div ref={containerRef} className={styles.mapContainer} />
      </Card>

      {stop ? (
        <Card className={styles.stopCard}>
          <div className={styles.stopHead}>
            <p className={styles.stopName}>{stop.name}</p>
            <button type="button" className={styles.clear} onClick={() => setSelectedStop(null)}>
              Close
            </button>
          </div>
          {servingRoutes.length > 0 ? (
            <div className={`${busStyles.routes} ${styles.stopRoutes}`}>
              {servingRoutes.map((r) => (
                <span key={r.id} className={busStyles.routeChip}>
                  <span className={busStyles.badge} style={{ background: r.color, color: r.textColor }}>
                    {r.shortName}
                  </span>
                  {r.longName}
                </span>
              ))}
            </div>
          ) : null}
          <div className={styles.departures}>
            {activeBoard === null ? (
              <div className={busStyles.loading}>Loading departures…</div>
            ) : (activeBoard[0]?.departures.length ?? 0) === 0 ? (
              <EmptyState title="No more buses today" />
            ) : (
              activeBoard[0]!.departures.map((d) => (
                <div key={`${d.tripId}-${d.minutes}`} className={busStyles.dep}>
                  <span className={busStyles.badge} style={{ background: d.color, color: d.textColor }}>
                    {d.route}
                  </span>
                  <span className={busStyles.depText}>
                    <span className={busStyles.depName}>{d.routeName}</span>
                    <span className={busStyles.depSub}>
                      {d.headsign ? `To ${d.headsign} · ` : ""}
                      {formatMinutes(d.minutes)} · Scheduled
                    </span>
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      ) : null}
    </>
  );
}

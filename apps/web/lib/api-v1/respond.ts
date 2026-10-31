import { v1Envelope } from "./envelope";

const CACHE = "public, max-age=60, s-maxage=300, stale-while-revalidate=1800";

/** The body of a v1 route: `{ v: 1, data }` with CDN cache headers, or a 500 if the loader throws. */
export async function v1Response<T>(load: () => Promise<T>): Promise<Response> {
  try {
    return Response.json(v1Envelope(await load()), { headers: { "Cache-Control": CACHE } });
  } catch (err) {
    console.error(err);
    return Response.json({ v: 1, error: "Data is unavailable right now." }, { status: 500 });
  }
}

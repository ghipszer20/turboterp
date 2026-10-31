// The shape every /api/v1 response has. Framework-free: the app client and the route handlers share it.

export const API_VERSION = 1 as const;

export type V1Envelope<T> = { v: typeof API_VERSION; data: T };

export function v1Envelope<T>(data: T): V1Envelope<T> {
  return { v: API_VERSION, data };
}

/** Is this value a `{ v: 1, data }` envelope? */
export function isV1Envelope(value: unknown): value is V1Envelope<unknown> {
  return typeof value === "object" && value !== null && (value as { v?: unknown }).v === API_VERSION && "data" in value;
}

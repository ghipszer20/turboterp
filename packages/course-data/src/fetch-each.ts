export type FetchEachResult<K, T> = { items: T[]; failed: { key: K; message: string }[] };

/**
 * Fetches each key's items one request at a time, pausing after every request. A key whose
 * fetch throws is tried again, up to `attempts` times in all; a key that never succeeds is
 * listed in `failed` (with its last error) so the caller can refuse to save a partial result.
 */
export async function fetchEach<K, T>(
  keys: K[],
  fetchOne: (key: K) => Promise<T[]>,
  options: { attempts: number; pause: () => Promise<void> },
): Promise<FetchEachResult<K, T>> {
  const result: FetchEachResult<K, T> = { items: [], failed: [] };
  for (const key of keys) {
    let message = "";
    let done = false;
    for (let attempt = 0; attempt < options.attempts && !done; attempt++) {
      try {
        result.items.push(...(await fetchOne(key)));
        done = true;
      } catch (err) {
        message = (err as Error).message;
      }
      await options.pause();
    }
    if (!done) result.failed.push({ key, message });
  }
  return result;
}

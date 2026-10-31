// Supabase's auth storage over expo-secure-store. SecureStore warns above about 2 KB per value and a
// session is bigger, so a value is split into chunks: `<key>` holds "chunks:<n>", `<key>.<i>` the pieces.

/** The slice of expo-secure-store we use. */
export interface SecureBackend {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}

export interface AuthStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export const CHUNK_SIZE = 1500;
const HEAD = "chunks:";

/** SecureStore keys may hold only letters, digits, ".", "-" and "_". */
const safeKey = (key: string) => key.replace(/[^A-Za-z0-9._-]/g, "_");

export function createChunkedStorage(backend: SecureBackend, chunkSize: number = CHUNK_SIZE): AuthStorage {
  const count = async (head: string | null) => {
    if (!head?.startsWith(HEAD)) return 0;
    const n = Number(head.slice(HEAD.length));
    return Number.isInteger(n) && n > 0 ? n : 0;
  };

  async function removeItem(key: string): Promise<void> {
    const k = safeKey(key);
    const n = await count(await backend.getItemAsync(k));
    for (let i = 0; i < n; i++) await backend.deleteItemAsync(`${k}.${i}`);
    await backend.deleteItemAsync(k);
  }

  return {
    async getItem(key) {
      const k = safeKey(key);
      const head = await backend.getItemAsync(k);
      if (head === null) return null;
      const n = await count(head);
      if (n === 0) return head.startsWith(HEAD) ? null : head; // a value stored whole
      let out = "";
      for (let i = 0; i < n; i++) {
        const piece = await backend.getItemAsync(`${k}.${i}`);
        if (piece === null) return null; // torn write: treat as signed out
        out += piece;
      }
      return out;
    },
    async setItem(key, value) {
      const k = safeKey(key);
      await removeItem(key); // drop leftover chunks of a longer earlier value
      const pieces: string[] = [];
      for (let i = 0; i < value.length; i += chunkSize) pieces.push(value.slice(i, i + chunkSize));
      for (let i = 0; i < pieces.length; i++) await backend.setItemAsync(`${k}.${i}`, pieces[i]);
      await backend.setItemAsync(k, `${HEAD}${pieces.length}`);
    },
    removeItem,
  };
}

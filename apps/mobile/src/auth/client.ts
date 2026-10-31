// The Supabase client for the app: session in expo-secure-store (chunked), refreshed only while the
// app is in the foreground. Created on first use so signed-out use never loads the library.
import { AppState, Platform } from "react-native";
import type { SupabaseClient } from "@supabase/supabase-js";
import { authConfigured, config } from "../config";
import { createChunkedStorage, type AuthStorage, type SecureBackend } from "./secure-storage";

export { authConfigured };

/** SecureStore on a phone; localStorage-less memory on web/Expo builds where the module is missing. */
function storage(): AuthStorage | undefined {
  if (Platform.OS === "web") return undefined;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const secure = require("expo-secure-store") as SecureBackend;
    return createChunkedStorage(secure);
  } catch {
    return undefined; // module unavailable: the session lasts until the app closes
  }
}

let client: Promise<SupabaseClient> | null = null;

export function getAuthClient(): Promise<SupabaseClient> {
  client ??= import("@supabase/supabase-js").then(({ createClient }) => {
    const c = createClient(config.supabaseUrl as string, config.supabaseAnonKey as string, {
      auth: {
        storage: storage(),
        flowType: "pkce",
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    // Tie token refresh to the app being in the foreground.
    const sync = (state: string) => void (state === "active" ? c.auth.startAutoRefresh() : c.auth.stopAutoRefresh());
    sync(AppState.currentState ?? "active");
    AppState.addEventListener("change", sync);
    return c;
  });
  return client;
}

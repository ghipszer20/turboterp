import type { SupabaseClient } from "@supabase/supabase-js";

// Next inlines NEXT_PUBLIC_* only for literal property access, so read them directly.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function authConfigured(): boolean {
  return Boolean(url && anonKey);
}

let client: Promise<SupabaseClient> | null = null;

/** The browser Supabase client, created on first use. The library loads only then. */
export function getAuthClient(): Promise<SupabaseClient> {
  client ??= import("@supabase/supabase-js").then(({ createClient }) => createClient(url as string, anonKey as string));
  return client;
}

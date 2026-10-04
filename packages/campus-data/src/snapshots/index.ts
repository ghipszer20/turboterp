// Server-only entry point (uses node:fs). Import as "@turboterp/campus-data/snapshots";
// never re-export from the package index, which client components import.
export * from "./build.ts";
export * from "./store.ts";
export * from "./supabase-store.ts";

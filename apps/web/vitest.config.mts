import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Tests resolve the "@/..." import alias the same way tsconfig and Next do.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
});

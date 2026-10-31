import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default defineConfig([
  globalIgnores(["dist/**", "dist-bridge/**", ".expo/**", "assets/**", "bridge/highs-inline.ts", "ios/**", "android/**"]),
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  { files: ["**/*.js", "**/*.cjs"], rules: { "@typescript-eslint/no-require-imports": "off" } },
  // The bridge test drives a browser through untyped CDP and page.evaluate calls.
  { files: ["test/**"], rules: { "@typescript-eslint/no-explicit-any": "off" } },
]);

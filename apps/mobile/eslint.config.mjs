import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default defineConfig([
  globalIgnores(["dist/**", ".expo/**", "assets/**", "bridge/highs-inline.ts", "ios/**", "android/**"]),
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
]);

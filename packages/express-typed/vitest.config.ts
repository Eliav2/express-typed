import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    /* for example, use global to avoid globals imports (describe, test, expect): */
    // globals: true,
    typecheck: {
      tsconfig: "tsconfig.tests.json",
      enabled: true,
      // include: ["**/*.{test,spec}-d.?(c|m)[jt]s?(x)"],
    },
  },
});

import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "packages/*",
  {
    test: {
      typecheck: {
        enabled: true,
        tsconfig: "tsconfig.tests.json",
      },
    },
  },
]);

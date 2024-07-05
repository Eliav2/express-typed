import { describe, it } from "vitest";
import { TypedRequest, TypedRouterNew } from "../src/express-typed";

describe("TypedRouter", () => {
  it("expected errors", () => {
    // typed TypedRequest
    const RN5 = new TypedRouterNew({
      "/not-typed": {
        get: (req) => {
          const a = req.params;
        },
      },

      "/:someParam": {
        get: (req) => {
          const param = req.params.someParam;
        },
      },
      "/typed": {
        get: (req: TypedRequest<{ body: {} }>) => {
          const a = req.params;
        },
      },
    });
  });
});

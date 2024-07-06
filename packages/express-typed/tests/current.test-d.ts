import { describe, it } from "vitest";
import { TypedRequest, TypedRouterNew } from "../src/express-typed";

describe("TypedRouter", () => {
  it("expected errors", () => {
    // typed TypedRequest
    const RN5 = new TypedRouterNew({
      "/nested1": new TypedRouterNew({
        "/test": {
          //    req: any
          //    |
          //    v
          get: (req) => {},
        },
        "/nested2": new TypedRouterNew({
          "/test": {
            //    req: TypedRequest<TypedRequestOptions & {params: {};}>
            //    |
            //    v
            get: (req) => {},
          },
          "/nested3": new TypedRouterNew({
            "/test": {
              //    req: any
              //    |
              //    v
              get: (req) => {},
              //    ^?
            },
          }),
        }),
      }),

      "/not-typed": {
        //    TypedRequest<TypedRequestOptions & {params: {};}>
        //    |
        //    v
        get: (req) => {
          const a = req.params;
        },
      },

      "/:someParam": {
        get: (req) => {
          // @ts-expect-error
          const error = req.params.error;
          const param = req.params.someParam;
        },
      },
      "/router": { wrong: (req) => {} },

      "/typed": {
        get: (req: TypedRequest<{ body: {} }>) => {
          const a = req.params;
        },
      },
    });
  });
});

import { describe, it } from "vitest";
import { TypedRequest, TypedRequestOptions, TypedRouter } from "../src/express-typed";

describe("TypedRouter", () => {
  it("expected errors", () => {
    // typed TypedRequest
    const RN5 = new TypedRouter({
      "/nested1": new TypedRouter({
        "/test": {
          get: (req) => {},
        },
        "/nested2": new TypedRouter({
          "/test": {
            get: (req) => {},
          },
          "/nested3": new TypedRouter({
            "/test": {
              get: (req) => {},
              posts: (req) => {},
            },
          }),
        }),
      }),

      "/not-typed": {
        get: (req) => {
          const a = req.params;
        },
      },

      "/:someParam": {
        get: (req) => {
          // @ts-expect-error
          const error = req.params?.error;
          const param = req.params?.someParam;
        },
      },
      "/router": {
        wrong: (req) => {},
      },

      "/explicitly-typed": {
        get: (req: TypedRequest<{ body: { val: string } }>) => {
          const a = req.params;
        },
      },
      "/:explicitly_typed_with_param": {
        get: (req: TypedRequest<{ body: { val: string } }>) => {
          const a = req.params;
        },
      },
    });
  });
});

type t1 = TypedRequest<{ body: { val: string } }> extends TypedRequest<
  { body: { val: string } } & { params: { explicitly_typed_with_param: string } }
>
  ? true
  : false;

type t2 = TypedRequestOptions & { params: { val: string } };
type t2_1 = t2["params"];
type t3 = TypedRequestOptions extends TypedRequestOptions & { params: { val: string } } ? true : false;

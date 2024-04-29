import { describe, expectTypeOf, it } from "vitest";
import {
  FlatNestedRouters,
  GetRouteResponseInfo,
  TypedRequest,
  TypedRequestReq,
  TypedResponse,
  TypedResponseRes,
  TypedRouter,
} from "../src/express-typed";

describe("FlatNestedRouters", () => {
  it("should work", () => {
    const typedRouter = new TypedRouter({
      "/": {
        get: (req, res) => {
          res.send("Hello World!").status(200);
        },
      },
      "/nested": new TypedRouter({
        "/": {
          get: (req, res) => {
            res.send("Hello World!").status(200);
          },
        },
        "/nested2": {
          get: (req, res) => {
            res.send("Hello World!").status(200);
          },
        },
        // "/nested3": new TypedRouter({
        //   "/": {
        //     get: (req, res) => {
        //       res.send("Hello World!").status(200);
        //     },
        //   },
        
        // }),
      }),
    });

    type flat = FlatNestedRouters<(typeof typedRouter)["routes"]>;
    type flatt1 = flat['/nested/nested2']
    type InferFunc<T> = T extends (x: infer I) => void ? I : never;
    type TT<T> = T extends { [k: string]: (x: infer I) => void }
      ? { [K in keyof I]: I[K] extends (x: infer I2) => void ? (K extends keyof I2 ? I2[K] : never) : I[K] }
      // ? { [K in keyof I]: I[K] }
      : never;
    type flat2 = TT<flat>['/nested/']

    type NestedGetResponse = flat["/nested/"];

    // 1
    //   type flat = {
    //     "/": (x: Pick<{
    //         "/": {
    //             get: (req: TypedRequest<TypedRequestReq>, res: TypedResponse<TypedResponseRes, []>) => void;
    //         };
    //         "/nested": TypedRouter<...>;
    //     }, "/">) => void;
    //     "/nested": (x: FlatNestedRouters<...>) => void;
    // }
    //   type flat = {
    //     "/": (x: Pick<{
    //         "/": {
    //             get: (req: TypedRequest<TypedRequestReq>, res: TypedResponse<TypedResponseRes, []>) => void;
    //         };
    //         "/nested": TypedRouter<...>;
    //     }, "/">) => void;
    //     "/nested": (x: FlatNestedRouters<...>) => void;
    // }

    expectTypeOf<flat>().toEqualTypeOf<{
      "/": {
        get: (req: TypedRequest<TypedRequestReq>, res: TypedResponse<TypedResponseRes, []>) => void;
      };
      "/nested/": {
        get: (req: TypedRequest<TypedRequestReq>, res: TypedResponse<TypedResponseRes, []>) => void;
      };
      "/nested/nested2": {
        get: (req: TypedRequest<TypedRequestReq>, res: TypedResponse<TypedResponseRes, []>) => void;
      };
    }>();
  });
});

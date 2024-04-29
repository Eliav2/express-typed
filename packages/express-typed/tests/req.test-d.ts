import { describe, expectTypeOf, it, test } from "vitest";
import { GetRouteRequest, GetRouteRequestHelper, ParseRoutes, TypedRequest, TypedRouter } from "../src/express-typed";
import { FilterUnknown } from "../src/type-utils";

type k = { name: number } & Record<string, any>;
type k2 = k['name123']
describe("request type tests", () => {
  const typedRouter = new TypedRouter({
    "/": {
      get: (req: TypedRequest<{ body: "bb"; query: { name: string } }>, res) => {
        const body = req.body;
        const test = res.send("Home").status(200);
        return test;
      },
    },
    "/async": {
      get: async (req, res) => {
        const test = await res.send("async Route!").status(200);
        return test;
      },
    },
  });

  type AppRoutes = ParseRoutes<typeof typedRouter>;

  type RouteReqResolver<
    Path extends keyof AppRoutes,
    Method extends keyof AppRoutes[Path],
    Info extends keyof GetRouteRequestHelper<AppRoutes, Path, Method> = Extract<
      keyof GetRouteRequestHelper<AppRoutes, Path, Method>,
      "body"
    >
  > = GetRouteRequest<AppRoutes, Path, Method, Info>;

  it("RouteReqResolver", () => {
    type t1 = RouteReqResolver<"/", "get">;
    type t2 = RouteReqResolver<"/", "get", "body">;
    type t3 = RouteReqResolver<"/", "get", "query">;

    // type GetRouteRequestHelper<
    //   Router extends TypedRouter<any>["routes"],
    //   Path extends keyof Router,
    //   Method extends keyof Router[Path]
    // > = Router[Path][Method] extends (req: infer Req, res: any) => any ? FilterUnknown<Req> : never;

    type tt1 = TypedRequest<{ body: "bb"; query: { name: string } }>["query"];
    // type tt2 = 
    type t3_1 = GetRouteRequestHelper<AppRoutes, "/", "get">

    type t10 = RouteReqResolver<"/async", "get">;

    expectTypeOf<t1>().toEqualTypeOf<"bb">();
    expectTypeOf<t2>().toEqualTypeOf<"bb">();
    expectTypeOf<t3>().toEqualTypeOf<{ name: string }>();
    expectTypeOf<t10>().toEqualTypeOf<unknown>();
  });

  it("req explicit type assertion", () => {
    const typedRouter = new TypedRouter({
      "/": {
        get: (req: TypedRequest<{ body: "bb"; query: "qq" }>, res) => {
          const body = req.body;
          expectTypeOf(body).toEqualTypeOf<"bb">();
          const test = res.send("Home").status(200);
          return test;
        },
      },
    });
  });
});

import { describe, expectTypeOf, it, test } from "vitest";
import { GetRouteRequest, GetRouteRequestHelper, ParseRoutes, TypedRequest, TypedRouter } from "../src/express-typed";

describe("request type tests", () => {
  const typedRouter = new TypedRouter({
    "/": {
      get: (req: TypedRequest<{ body: "bb"; query: "qq" }>, res) => {
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
    type t10 = RouteReqResolver<"/async", "get">;

    expectTypeOf<t1>().toEqualTypeOf<"bb">();
    expectTypeOf<t2>().toEqualTypeOf<"bb">();
    expectTypeOf<t3>().toEqualTypeOf<"qq">();
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

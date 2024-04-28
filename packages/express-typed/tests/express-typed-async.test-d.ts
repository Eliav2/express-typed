import { expectTypeOf, test } from "vitest";
import { GetRouteResponseInfo, GetRouteResponseInfoHelper, ParseRoutes, TypedRouter } from "../src/express-typed";

const typedRouter = new TypedRouter({
  "/": {
    get: (req, res) => {
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

export type AppRoutes = ParseRoutes<typeof typedRouter>;

//// RouteResolver
export type RouteResolver<
  Path extends keyof AppRoutes,
  Method extends keyof AppRoutes[Path],
  Info extends keyof GetRouteResponseInfoHelper<AppRoutes, Path, Method> | "body" = "body"
> = GetRouteResponseInfo<AppRoutes, Path, Method, Info>;

test("RouteResolver test async route", () => {
  type HomeRouteResponse = RouteResolver<"/", "get">;
  expectTypeOf<HomeRouteResponse>().toEqualTypeOf<"Home">();
  type HomeRouteResponseInfo = GetRouteResponseInfoHelper<AppRoutes, "/", "get">;
  expectTypeOf<HomeRouteResponseInfo>().toEqualTypeOf<{ send: "Home" } & { status: 200 }>();

  type AsyncRouteResponse = RouteResolver<"/async", "get">;
  type AsyncRouteResponseInfo = GetRouteResponseInfoHelper<AppRoutes, "/async", "get">;
  expectTypeOf<AsyncRouteResponse>().toEqualTypeOf<"async Route!">();
  expectTypeOf<AsyncRouteResponseInfo>().toEqualTypeOf<{ send: "async Route!" } & { status: 200 }>();
});

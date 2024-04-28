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
    // async methods are supported
    post: async (req, res) => {
      const test = (await (await fetch("https://jsonplaceholder.typicode.com/todos/1")).json()) as {
        userId: number;
        id: number;
        title: string;
        completed: boolean;
      };
      return res.json(test).status(200);
    },
  },
});

export type AppRoutes = ParseRoutes<typeof typedRouter>;

//// RouteResResolver
export type RouteResResolver<
  Path extends keyof AppRoutes,
  Method extends keyof AppRoutes[Path],
  Info extends keyof GetRouteResponseInfoHelper<AppRoutes, Path, Method> | "body" = "body"
> = GetRouteResponseInfo<AppRoutes, Path, Method, Info>;

test("RouteResResolver test async route", () => {
  type HomeRouteResponse = RouteResResolver<"/", "get">;
  expectTypeOf<HomeRouteResponse>().toEqualTypeOf<"Home">();
  type HomeRouteResponseInfo = GetRouteResponseInfoHelper<AppRoutes, "/", "get">;
  expectTypeOf<HomeRouteResponseInfo>().toEqualTypeOf<{ send: "Home" } & { status: 200 }>();

  type AsyncRouteResponse = RouteResResolver<"/async", "get">;
  type AsyncRouteResponseInfo = GetRouteResponseInfoHelper<AppRoutes, "/async", "get">;
  expectTypeOf<AsyncRouteResponse>().toEqualTypeOf<"async Route!">();
  expectTypeOf<AsyncRouteResponseInfo>().toEqualTypeOf<{ send: "async Route!" } & { status: 200 }>();

  type AsyncPostRouteResponse = RouteResResolver<"/async", "post">;
  type AsyncPostRouteResponseInfo = GetRouteResponseInfoHelper<AppRoutes, "/async", "post">;
  expectTypeOf<AsyncPostRouteResponse>().toEqualTypeOf<{ userId: number; id: number; title: string; completed: boolean }>();
  expectTypeOf<AsyncPostRouteResponseInfo>().toEqualTypeOf<
    { status: 200 } & { json: { userId: number; id: number; title: string; completed: boolean } }
  >();
});

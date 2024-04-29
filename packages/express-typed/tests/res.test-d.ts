import { expectTypeOf, test } from "vitest";
import { GetRouteResponseInfo, GetRouteResponseInfoHelper, ParseRoutes, TypedResponse, TypedRouter } from "../src/express-typed";

test("res explicit type assertion", () => {
  const typedRouter = new TypedRouter({
    "/": {
      get: (req, res) => {
        return res.send("get: /").status(200);
      },
    },
    "/register": {
      get: (req, res: TypedResponse<{ body: { name: string } }>) => {
        type resParams = Parameters<(typeof res)["json"]>[0];
        expectTypeOf<resParams>().toEqualTypeOf<{ name: string } | undefined>();
        return res.json({
          // @ts-expect-error 'success' does not exist in type '{ name: string; }'
          success: true,
          data: {
            message: "Account registered",
          },
        });
        // }
      },
    },
    "/nested": new TypedRouter({
      "/": {
        get: (req, res) => {
          return res.send("get /nested/").status(200);
        },
        post: async (req, res) => {
          return res.json({ name: "eliav" }).status(200);
        },
      },
    }),
  });
  type AppRoutes = ParseRoutes<typeof typedRouter>;

  type RouteResResolver<
    Path extends keyof AppRoutes,
    Method extends keyof AppRoutes[Path],
    Info extends keyof GetRouteResponseInfoHelper<AppRoutes, Path, Method> | "body" = "body"
  > = GetRouteResponseInfo<AppRoutes, Path, Method, Info>;
  type RegisterGetResponseInfo = GetRouteResponseInfoHelper<AppRoutes, "/register", "get">;
  type RegisterGetResponse = GetRouteResponseInfo<AppRoutes, "/register", "get">;
  type RegisterGetResponseResolver = RouteResResolver<"/register", "get">;

  type HomeGetResponseInfo = GetRouteResponseInfo<AppRoutes, "/", "get">;
  expectTypeOf<HomeGetResponseInfo>().toEqualTypeOf<"get: /">();
  expectTypeOf<RegisterGetResponseInfo>().toEqualTypeOf<{ json: { name: string } }>();
  expectTypeOf<RegisterGetResponse>().toEqualTypeOf<{ name: string }>();
  expectTypeOf<RegisterGetResponseResolver>().toEqualTypeOf<{ name: string }>();

  type NestedGetResponseInfo = GetRouteResponseInfo<AppRoutes, "/nested/", "get">;
  expectTypeOf<NestedGetResponseInfo>().toEqualTypeOf<"get /nested/">();
  type NestedPostResponseInfo = GetRouteResponseInfo<AppRoutes, "/nested/", "post">;
  expectTypeOf<NestedPostResponseInfo>().toEqualTypeOf<{ readonly name: "eliav" }>();
});

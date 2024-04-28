import { expectTypeOf, test } from "vitest";
import { GetRouteResponseInfo, GetRouteResponseInfoHelper, ParseRoutes, TypedResponse, TypedRouter } from "../src/express-typed";

test("res explicit type assertion", () => {
  const typedRouter = new TypedRouter({
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
  });
  type AppRoutes = ParseRoutes<typeof typedRouter>;

  type RouteResResolver<
    Path extends keyof AppRoutes,
    Method extends keyof AppRoutes[Path],
    Info extends keyof GetRouteResponseInfoHelper<AppRoutes, Path, Method> | "body" = "body"
  > = GetRouteResponseInfo<AppRoutes, Path, Method, Info>;
});

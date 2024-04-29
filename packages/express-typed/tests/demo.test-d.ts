import { expectTypeOf, test } from "vitest";
import { GetRouteResponseInfo, ParseRoutes } from "../src/express-typed";
import typedRouter from "./test-router";

// Test TypedRouter
test("TypedRouter", () => {
  type AppRoutes = ParseRoutes<typeof typedRouter>;

  type HomeGetResponse = GetRouteResponseInfo<AppRoutes, "/", "get">;
  //   ^? "get: /"
  type HomePostResponse = GetRouteResponseInfo<AppRoutes, "/", "post">;
  //   ^? "post: /"
  type ExplicitReqGetResponse = GetRouteResponseInfo<AppRoutes, "/explicit-req", "get">;
  //   ^? { name: string }
  type ExplicitResGetResponse = GetRouteResponseInfo<AppRoutes, "/explicit-res", "get">;
  //   ^? { readonly name: "eliav" }
  type NestedGetResponse = GetRouteResponseInfo<AppRoutes, "/nested/", "get">;
  //   ^? "get /nested/"
  type NestedPostResponse = GetRouteResponseInfo<AppRoutes, "/nested/", "post">;
  //   ^? { userId: number; id: number; title: string; completed: boolean }
  type AllMethodsResponse = GetRouteResponseInfo<AppRoutes, "/nested/all", "all">;
  //   ^? "responding to all methods"

  expectTypeOf<HomeGetResponse>().toEqualTypeOf<"get: /">();
  expectTypeOf<HomePostResponse>().toEqualTypeOf<"post: /">();
  expectTypeOf<ExplicitReqGetResponse>().toEqualTypeOf<{ name: string }>();
  expectTypeOf<ExplicitResGetResponse>().toEqualTypeOf<{ readonly name: "eliav" }>();
  expectTypeOf<NestedGetResponse>().toEqualTypeOf<"get /nested/">();
  expectTypeOf<NestedPostResponse>().toEqualTypeOf<{ userId: number; id: number; title: string; completed: boolean }>();
  expectTypeOf<AllMethodsResponse>().toEqualTypeOf<"responding to all methods">();
});

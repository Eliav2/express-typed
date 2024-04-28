import { expectTypeOf, test } from "vitest";
import { GetRouteResponseInfo, ParseRoutes } from "../src/express-typed";
import typedRouter from "./test-router";

// Test TypedRouter
test("TypedRouter", () => {
  type AppRoutes = ParseRoutes<typeof typedRouter>;

  type ExplicitReqGetResponse = GetRouteResponseInfo<AppRoutes, "/explicit-req", "get">;
  type ExplicitResGetResponse = GetRouteResponseInfo<AppRoutes, "/explicit-res", "get">;
  type NestedGetResponse = GetRouteResponseInfo<AppRoutes, "/nested/", "get">;
  type NestedPostResponse = GetRouteResponseInfo<AppRoutes, "/nested/", "post">;

  expectTypeOf<ExplicitReqGetResponse>().toEqualTypeOf<{ name: string }>();
  expectTypeOf<ExplicitResGetResponse>().toEqualTypeOf<{ readonly name: "eliav" }>();
  expectTypeOf<NestedGetResponse>().toEqualTypeOf<"get /nested/">();
  expectTypeOf<NestedPostResponse>().toEqualTypeOf<{ userId: number; id: number; title: string; completed: boolean }>();
});

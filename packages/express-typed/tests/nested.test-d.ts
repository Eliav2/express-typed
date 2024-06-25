import { expectTypeOf, test } from "vitest";
import { GetRouteResponseInfo, ParseRoutes, TypedRequest, TypedResponse, TypedRouter } from "../src/express-typed";

// Test TypedRouter
test("TypedRouter", () => {
  const typedRouter = new TypedRouter({

    // nested router are allowed, and fully typed
    "/nested": new TypedRouter({
      "/": {
        get: (req, res) => {
          const test = res.send("get /nested/").status(200);
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
      // any of "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head" is allowed as a method
      "/all": {
        all: (req, res) => {
          return res.send("responding to all methods");
        },
      },
    }),
  });

  type AppRoutes = ParseRoutes<typeof typedRouter>;

  type NestedGetResponse = GetRouteResponseInfo<AppRoutes, "/nested/", "get">;
  //   ^? "get /nested/"
  type NestedPostResponse = GetRouteResponseInfo<AppRoutes, "/nested/", "post">;
  //   ^? { userId: number; id: number; title: string; completed: boolean }
  type AllMethodsResponse = GetRouteResponseInfo<AppRoutes, "/nested/all", "all">;
  //   ^? "responding to all methods"


  expectTypeOf<NestedGetResponse>().toEqualTypeOf<"get /nested/">();
  expectTypeOf<NestedPostResponse>().toEqualTypeOf<{ userId: number; id: number; title: string; completed: boolean }>();
  expectTypeOf<AllMethodsResponse>().toEqualTypeOf<"responding to all methods">();
});

import {
  FlatNestedRouters,
  GetRouteResponseInfo,
  GetRouteResponseInfoHelper,
  GetRouterMethods,
  HandlerMethods,
  KeysWithMethod,
  ParseRoutes,
  TypedRouter,
  UnionToIntersection,
} from "../src/express-typed";

const typedRouter = new TypedRouter({
  "/": {
    get: (req, res) => {
      const test = res.send("Typesafe Route!").status(200);
      return test;
    },
  },
  "/test": {
    get: (req, res) => {
      return res.json({ message: 123 }).status(200).send("test");
    },
    post: (req, res) => {
      return res.send("post res!").status(200);
    },
  },
  "/post-only": {
    post: (req, res) => {
      return res.send("post only res!").status(200);
    },
  },
  "/nested": new TypedRouter({
    "/": {
      get: (req, res) => {
        const test = res.send("get /nested/").status(200);
        return test;
      },
      post: (req, res) => {
        const test = res.json("json response, post, /nested/").status(200).send("text response, post, /nested/");
        return test;
      },
    },
    "/all": {
      all: (req, res) => {
        return res.send("responding to all methods");
      },
    },
  }),
});

type TypedRoutes = ParseRoutes<typeof typedRouter>;

// // usage

export type AppRoutes = ParseRoutes<typeof typedRouter>;
//          ^?

//// RouteResolver
export type RouteResolver<
  Path extends keyof AppRoutes,
  Method extends keyof AppRoutes[Path],
  Info extends keyof GetRouteResponseInfoHelper<AppRoutes, Path, Method> | "body" = "body"
> = GetRouteResponseInfo<AppRoutes, Path, Method, Info>;

// example usage
// get the response from the home page
type HomePageResponse = RouteResolver<"/", "get">;
//   ^?
// get specific info from the response (here, the status code)
type HomePageStatus = RouteResolver<"/", "get", "status">;
//   ^?
////

type testKeysWithMethod = KeysWithMethod<typeof typedRouter, "post">;

//// RoutesWithMethod
// export type RoutesWithMethod<Method extends HandlerMethods> = {
//   [key in KeysWithMethod<AppRoutes, Method>]: Method extends keyof AppRoutes[key] ? GetRouteResponseInfo<AppRoutes, key, Method> : never;
// };

export type TypedRoutesWithMethod<Router extends TypedRouter<any>, Method extends GetRouterMethods<Router>> = {
  [Path in KeysWithMethod<Router, Method>]: Method extends keyof ParseRoutes<Router>[Path] ? GetRouteResponseInfo<ParseRoutes<Router>, Path, Method> : never;
};

// usage
// get all routes that have a "get" method, and their response types
type GetRoutes = TypedRoutesWithMethod<typeof typedRouter,"get">;
//   ^?
// get all routes that have a "post" method, and their response types
type PostRoutes = RoutesWithMethod<"post">;
//   ^?
////

import { expect, expectTypeOf, test } from "vitest";

// Test TypedRouter
test("TypedRouter", () => {
  const typedRouter = new TypedRouter({
    "/": {
      get: (req, res) => {
        const test = res.send("Typesafe Route!").status(200);
        return test;
      },
    },
    "/test": {
      get: (req, res) => {
        return res.json({ message: 123 }).status(200).send("test");
      },
      post: (req, res) => {
        return res.send("post res!").status(200);
      },
    },
  });

  expect(typedRouter).toBeDefined();
});

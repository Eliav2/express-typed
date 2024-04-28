import {
  FlatNestedRouters,
  GetRouteResponseInfo,
  GetRouteResponseInfoHelper,
  GetRouterMethods,
  GetRoutesWithMethod,
  ParseRoutes,
  TypedRouter,
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

//// RouteResResolver
export type RouteResResolver<
  Path extends keyof AppRoutes,
  Method extends keyof AppRoutes[Path],
  Info extends keyof GetRouteResponseInfoHelper<AppRoutes, Path, Method> | "body" = "body",
> = GetRouteResponseInfo<AppRoutes, Path, Method, Info>;

// example usage
// get the response from the home page
type HomePageResponse = RouteResResolver<"/", "get">;
//   ^?
// get specific info from the response (here, the status code)
type HomePageStatus = RouteResResolver<"/", "get", "status">;
//   ^?
////

// type testKeysWithMethod = GetRoutesWithMethodHelper<typeof typedRouter, "post">;

test("RoutesWithMethod", () => {
  //// RoutesWithMethod
  type RoutesWithMethod<Method extends GetRouterMethods<AppRoutes>> = GetRoutesWithMethod<AppRoutes, Method>;

  // usage
  // get all routes that have a "get" method, and their response types
  type GetRoutes = RoutesWithMethod<"get">;
  //   ^?

  expectTypeOf<GetRoutes>().toEqualTypeOf<{
    "/": "Typesafe Route!";
    "/test":
      | {
          readonly message: 123;
        }
      | "test";
    "/nested/": "get /nested/";
  }>();

  // get all routes that have a "post" method, and their response types
  type PostRoutes = RoutesWithMethod<"post">;
  //   ^?

  expectTypeOf<PostRoutes>().toEqualTypeOf<{
    "/test": "post res!";
    "/post-only": "post only res!";
    "/nested/": "json response, post, /nested/" | "text response, post, /nested/";
  }>();

  ////
});

import { expectTypeOf, test } from "vitest";

// Test ParseRoutes
test("ParseRoutes", () => {
  const testRoutes: ParseRoutes<typeof typedRouter> = {
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
    "/nested/": {
      get: (req, res) => {
        return res.send("get /nested/").status(200);
      },
      post: (req, res) => {
        return res.json("json response, post, /nested/").status(200).send("text response, post, /nested/");
      },
    },
    "/nested/all": {
      all: (req, res) => {
        return res.send("responding to all methods");
      },
    },
    "/post-only": {
      post: (req, res) => {
        return res.send("post only res!").status(200);
      },
    },
  };
});

// Test GetRouteResponseInfoHelper
test("GetRouteResponseInfoHelper", () => {
  type TestRoutes = ParseRoutes<typeof typedRouter>;
  type TestResponseInfo = GetRouteResponseInfoHelper<TestRoutes, "/test", "get">;

  const testResponseInfo: TestResponseInfo = {
    status: 200,
    json: { message: 123 },
    send: "test",
  };
});

// Test GetRouteResponseInfo
test("GetRouteResponseInfo", () => {
  type TestRoutes = ParseRoutes<typeof typedRouter>;
  type TestResponse = GetRouteResponseInfo<TestRoutes, "/test", "get">;
  const testResponse: TestResponse = {
    message: 123,
  };
});

// Test RouteResResolver
test("RouteResResolver", () => {
  const testRouteResolverDefault: RouteResResolver<"/", "get"> = "Typesafe Route!";
  const testRouteResolverStatus: RouteResResolver<"/", "get", "status"> = 200;
  const testRouteResolverJson: RouteResResolver<"/test", "get", "json"> = { message: 123 };
  const testRouteResolverSend: RouteResResolver<"/test", "get", "send"> = "test";
});

test("FlatNestedRouters", () => {
  type TestRoutes = ParseRoutes<typeof typedRouter>;
  type FlatRoutes = FlatNestedRouters<TestRoutes>;

  const flatRoutes: FlatRoutes = {
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
    "/nested/": {
      get: (req, res) => {
        return res.send("get /nested/").status(200);
      },
      post: (req, res) => {
        return res.json("json response, post, /nested/").status(200).send("text response, post, /nested/");
      },
    },
    "/nested/all": {
      all: (req, res) => {
        return res.send("responding to all methods");
      },
    },
  };
});

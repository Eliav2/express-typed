import {
  FlatNestedRouters,
  GetRouteResponseInfo,
  GetRouteResponseInfoHelper,
  HandlerMethods,
  KeysWithMethod,
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

//// RoutesWithMethod
export type RoutesWithMethod<Method extends HandlerMethods> = {
  [key in KeysWithMethod<AppRoutes, Method>]: Method extends keyof AppRoutes[key] ? GetRouteResponseInfo<AppRoutes, key, Method> : never;
};

// usage
// get all routes that have a "get" method, and their response types
type GetRoutes = RoutesWithMethod<"get">;
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

// Test RoutesWithMethod
test("RoutesWithMethod", () => {
  const testGetRoutes: RoutesWithMethod<"get"> = {
    "/": "Typesafe Route!2",
    "/test": "test",
    "/nested/": "get /nested/",
  };
  const testPostRoutes: RoutesWithMethod<"post"> = {
    "/test": "post res!",
    "/post-only": "post only res!",
    "/nested/": "text response, post, /nested/",
  };
});

// Test RouteResolver
test("RouteResolver", () => {
  const testRouteResolverDefault: RouteResolver<"/", "get"> = "Typesafe Route!";
  const testRouteResolverStatus: RouteResolver<"/", "get", "status"> = 200;
  const testRouteResolverJson: RouteResolver<"/test", "get", "json"> = { message: 123 };
  const testRouteResolverSend: RouteResolver<"/test", "get", "send"> = "test";
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

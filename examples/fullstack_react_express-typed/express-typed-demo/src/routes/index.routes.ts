import { GetRouteResponseInfo, TypedRouter, ParseRoutes, GetRouteResponseInfoHelper, HandlerMethods, KeysWithMethod } from "express-typed";

import nestedRouter from "./nested.routes";

const typedRouter = new TypedRouter({
  // example usage
  "/": {
    get: (req, res) => {
      return res.send("Hello world").status(200);
    },
  },
  "/mutate": {
    post: (req, res) => {
      return res.send("Mutated!").status(201);
    },
  },
  "/json": {
    get: (req, res) => {
      return res.json({ message: "json" }).status(200);
    },
  },
  "/multiple-methods": {
    get: (req, res) => {
      return res.send("get response").status(200);
    },
    post: (req, res) => {
      return res.send("post response").status(201);
    },
  },
  // nested routers also supported
  "/nested": nestedRouter,
});

export default typedRouter;

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

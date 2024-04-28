import {
  GetRouteRequest,
  GetRouteRequestHelper,
  GetRouteResponseInfo,
  GetRouteResponseInfoHelper,
  GetRouterMethods,
  GetRoutesWithMethod,
  ParseRoutes,
  TypedRequest,
  TypedRouter,
} from "express-typed";

import nestedRouter from "./nested.routes";

const typedRouter = new TypedRouter({
  // example usage
  "/": {
    get: (req, res) => {
      return res.send("Hello world").status(200);
    },
  },
  "/mutate": {
    post: (req: TypedRequest<{ body: { name: string } }>, res) => {
      return res.send(req.body).status(201);
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

//// RouteResResolver
export type RouteResResolver<
  Path extends keyof AppRoutes,
  Method extends keyof AppRoutes[Path],
  Info extends keyof GetRouteResponseInfoHelper<AppRoutes, Path, Method> | "body" = "body"
> = GetRouteResponseInfo<AppRoutes, Path, Method, Info>;

// example usage
// get the response from the home page
type HomePageResponse = RouteResResolver<"/", "get">;
//   ^?
// get specific info from the response (here, the status code)
type HomePageStatus = RouteResResolver<"/", "get", "status">;
//   ^?
////

//// RoutesWithMethod
export type RoutesWithMethod<Method extends GetRouterMethods<AppRoutes>> = GetRoutesWithMethod<AppRoutes, Method>;

// usage
// get all routes that have a "get" method, and their response types
type GetRoutes = RoutesWithMethod<"get">;
//   ^? type GetRoutes = { "/": "Hello world"};
// get all routes that have a "post" method, and their response types
type PostRoutes = RoutesWithMethod<"post">;
//   ^?
////

export type RouteReqResolver<
  Path extends keyof AppRoutes,
  Method extends keyof AppRoutes[Path],
  Info extends keyof GetRouteRequestHelper<AppRoutes, Path, Method> = Extract<keyof GetRouteRequestHelper<AppRoutes, Path, Method>, "body">
> = GetRouteRequest<AppRoutes, Path, Method, Info>;

// usage
// get the request type for the "/mutate" route
type MutateRouteRequest = RouteReqResolver<"/mutate", "post">

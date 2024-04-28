import { GetRouteResponseInfo, TypedRouter, ParseRoutes, GetRouteResponseInfoHelper, HandlerMethods, KeysWithMethod } from "express-typed";

const typedRouter = new TypedRouter({
  // example usage
  "/": {
    get: (req, res) => {
      return res.send("Hello world").status(200);
    },
  },
});

export default typedRouter;

export type AppRoutes = ParseRoutes<typeof typedRouter>;

export type RouteResolver<
  Path extends keyof AppRoutes,
  Method extends keyof AppRoutes[Path],
  Info extends keyof GetRouteResponseInfoHelper<AppRoutes, Path, Method> | "body" = "body"
> = GetRouteResponseInfo<AppRoutes, Path, Method, Info>;


export type RoutesWithMethod<Method extends HandlerMethods> = {
  [key in KeysWithMethod<AppRoutes, Method>]: Method extends keyof AppRoutes[key] ? GetRouteResponseInfo<AppRoutes, key, Method> : never;
};



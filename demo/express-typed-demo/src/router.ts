import { GetRouteResponseInfo, GetRoutesInfo, InferRes, TypedRouter, HandlerMethods, KeysWithMethod } from "express-typed";

const typedRouter = new TypedRouter({
  "/": {
    get: (req, res) => {
      return res.send("Typesafe Route!").status(200);
    },
    post: (req, res) => {
      return res.send(req.body).status(200);
    },
  },
  "/test": {
    get: (req, res) => {
      return res.send("TEST! Typesafe Route!").status(200);
    },
  },
  "/mutate": {
    post: (req, res) => {
      return res.send("Mutated!").status(200);
    },
  },
  "/json": {
    get: (req, res) => {
      return res.json({ message: "json" }).status(200);
    },
  },
});

export default typedRouter;

export type TypedRoutes = GetRoutesInfo<typeof typedRouter>;
//   ^?
//   type TypedRoutes = {
//     "/": {
//         get: (req: Request<ParamsDictionary, any, any, QueryString.ParsedQs, Record<string, any>>, res: IHandlerResponse<[]>) => IHandlerResponse<...>;
//         post: (req: Request<...>, res: IHandlerResponse<...>) => IHandlerResponse<...>;
//     };
//     "/test": {
//         ...;
//     };
//   }

export type RouteResolver<Path extends keyof TypedRoutes, Method extends keyof TypedRoutes[Path]> = GetRouteResponseInfo<
  typeof typedRouter,
  Path,
  Method
>;
export type RouteResponseResolver<Path extends keyof TypedRoutes, Method extends keyof TypedRoutes[Path]> = InferRes<
  GetRouteResponseInfo<typeof typedRouter, Path, Method>
>;

export type RoutesWithMethod<Method extends HandlerMethods> = {
  [key in KeysWithMethod<TypedRoutes, Method>]: Method extends keyof TypedRoutes[key] ? RouteResponseResolver<key, Method> : never;
};

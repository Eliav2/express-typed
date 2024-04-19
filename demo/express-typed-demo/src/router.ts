import { GetRouteResponseInfo, GetRoutesInfo, InferRes, TypedRouter } from "express-typed";

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
});

// export type TypedRoutes = (typeof typedRouter)['routes'];

type TypedRoutes = GetRoutesInfo<typeof typedRouter>;
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

type RoutesResolver<Path extends keyof TypedRoutes, Method extends keyof TypedRoutes[Path]> = GetRouteResponseInfo<
  typeof typedRouter,
  Path,
  Method
>;
type RoutesResponseResolver<Path extends keyof TypedRoutes, Method extends keyof TypedRoutes[Path]> = InferRes<
  GetRouteResponseInfo<typeof typedRouter, Path, Method>
>;

type HomeRouteInfo = RoutesResolver<"/", "get">;
type HomeRouteResponse = RoutesResponseResolver<"/", "get">;
//   ^?
//   type HomeRouteResponse = "Typesafe Route!"


export default typedRouter;

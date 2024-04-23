import { GetRouteResponseInfo, GetRoutesInfo, HandlerMethods, InferRes, KeysWithMethod, TypedRouter } from "./express-typed";

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
  // "/nested": new TypedRouter({
  //   "/": {
  //     get: (req, res) => {
  //       return res.send("nested").status(200);
  //     },
  //   },
  // }),
});
export type TypedRoutes = GetRoutesInfo<typeof typedRouter>;
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
// usage
type HomeRouteInfo = RouteResolver<"/", "get">;
type HomeRouteResponse = RouteResponseResolver<"/", "get">;
type GetRoutesWithPostMethod = RoutesWithMethod<"get">;

// type NestedRouteInfo = RouteResolver<"/nested", "">;

// type Test<R extends Record<string, Partial<Record<HandlerMethods, (req: IHandlerRequest, res: IHandlerResponse, next: NextFunction) => void>>>> = {
//   [K in keyof R]: {
//     [P in keyof R[K]]: P extends HandlerMethods ? R[K][P] : never;
//   };
// };

// type t1 = Test<{ "/": { get: any } }>;

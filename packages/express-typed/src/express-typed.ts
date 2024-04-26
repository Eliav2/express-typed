import express, { Request, Response, NextFunction } from "express";

export type IHandlerResponse<Res extends any[] = []> = {
  status<const T>(arg: T): IHandlerResponse<[...Res, { status: T }]>;
  links<const T>(arg: T): IHandlerResponse<[...Res, { links: T }]>;
  sendStatus<const T>(arg: T): IHandlerResponse<[...Res, { sendStatus: T }]>;
  contentType<const T>(arg: T): IHandlerResponse<[...Res, { contentType: T }]>;
  type<const T>(arg: T): IHandlerResponse<[...Res, { type: T }]>;
  format<const T>(arg: T): IHandlerResponse<[...Res, { format: T }]>;
  attachment<const T>(arg: T): IHandlerResponse<[...Res, { attachment: T }]>;

  json<const T>(arg: T): IHandlerResponse<[...Res, { json: T }]>;
  jsonp<const T>(arg: T): IHandlerResponse<[...Res, { jsonp: T }]>;
  send<const T>(arg: T): IHandlerResponse<[...Res, { send: T }]>;
} & Response;

export type SendMethod = "send" | "json" | "jsonp";

export type IHandlerRequest<Req extends any[] = []> = {} & Request;

export type HandlerMethods = "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head";

/**
 * TypedRouter is a type-safe wrapper for Express Router.
 *
 * @example
 * ```ts
 * const typedRouter = new TypedRouter({
 *   "/": {
 *     get: (req, res) => {
 *       const test = res.send("Typesafe Route!").status(200);
 *       return test;
 *     },
 *   },
 *   "/test": {
 *     get: (req, res) => {
 *       return res.json({ message: 123 }).status(200).send("test");
 *     },
 *     post: (req, res) => {
 *       return res.send("post res!").status(200);
 *     },
 *   },
 *   "post-only": {
 *     post: (req, res) => {
 *       return res.send("post only res!").status(200);
 *     },
 *   },
 * });
 * export type TypedRoutes = GetRoutesInfo<typeof typedRouter>;
 * export type RouteResolver<Path extends keyof TypedRoutes, Method extends keyof TypedRoutes[Path]> = GetRouteResponseInfo<
 *   typeof typedRouter,
 *   Path,
 *   Method
 * >;
 * export type RouteResponseResolver<Path extends keyof TypedRoutes, Method extends keyof TypedRoutes[Path]> = InferRes<
 *   GetRouteResponseInfo<typeof typedRouter, Path, Method>
 * >;
 * export type RoutesWithMethod<Method extends HandlerMethods> = {
 *   [key in KeysWithMethod<TypedRoutes, Method>]: Method extends keyof TypedRoutes[key] ? RouteResponseResolver<key, Method> : never;
 * };
 * // usage
 * type HomeRouteInfo = RouteResolver<"/", "get">;
 * type HomeRouteResponse = RouteResponseResolver<"/", "get">;
 * type GetRoutesWithPostMethod = RoutesWithMethod<"get">;
 * ```
 */
export class TypedRouter<
  R extends {
    [K in string]: R[K] extends TypedRouter<infer N>
      ? TypedRouter<N>
      :
          | {
              [key in HandlerMethods]?: (req: IHandlerRequest, res: IHandlerResponse, next: NextFunction) => void;
            }
          | TypedRouter<any>;
  }
> {
  router: express.Router;
  routes: R;

  constructor(routes: R) {
    this.router = express.Router();
    this.routes = routes;

    for (const path in this.routes) {
      for (const method in this.routes[path]) {
        const route = this.routes[path];
        if (route instanceof TypedRouter) {
          this.router.use(path, route["router"]);
        } else {
          (this.router as any)[method](path, this.routes[path][method]);
        }
      }
    }
  }
}

export type FlatNestedRouters<T> = {
  [K in keyof T]: K extends string
    ? (
        x: T[K] extends TypedRouter<infer N>
          ? FlatNestedRouters<{ [K2 in keyof N extends string ? `${keyof N}` : "" as `${K}${K2}`]: N[K2] }>
          : Pick<T, K>
      ) => void
    : never;
} extends { [k: string]: (x: infer I) => void }
  ? { [K in keyof I]: I[K] }
  : never;

export type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

export type GetRouteResponseInfoHelper<
  Router extends TypedRouter<any>["routes"],
  Path extends keyof FlatNestedRouters<Router>,
  Method extends keyof FlatNestedRouters<Router>[Path]
> = UnionToIntersection<
  (
    ReturnType<
      FlatNestedRouters<Router>[Path][Method] extends (...args: any) => any ? FlatNestedRouters<Router>[Path][Method] : never
    > extends IHandlerResponse<infer Res>
      ? Res
      : never
  ) extends (infer U)[]
    ? U
    : never
>;

export type GetRouteResponseInfo<
  Router extends TypedRouter<any>["routes"],
  Path extends keyof FlatNestedRouters<Router>,
  Method extends keyof FlatNestedRouters<Router>[Path],
  Info extends keyof GetRouteResponseInfoHelper<Router, Path, Method> | "body" = "body"
  // Info extends "body" | undefined = undefined
> = Info extends "body"
  ? GetRouteResponseInfoHelper<Router, Path, Method>[Extract<keyof GetRouteResponseInfoHelper<Router, Path, Method>, SendMethod>]
  : Info extends keyof GetRouteResponseInfoHelper<Router, Path, Method>
  ? GetRouteResponseInfoHelper<Router, Path, Method>[Info]
  : GetRouteResponseInfoHelper<Router, Path, Method>;

export type ParseRoutes<T extends TypedRouter<any>> = FlatNestedRouters<T["routes"]>;

export type KeysWithMethod<T, Method extends string> = {
  [K in keyof T]: Method extends keyof T[K] ? K : never;
}[keyof T];

////////////////
// example usage

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

type RoutesWithMethod<
  Method extends HandlerMethods
  // Info extends keyof TypedRoutes[keyof TypedRoutes]
  // Info extends keyof GetRouteResponseInfoHelper<TypedRoutes, keyof TypedRoutes, Method> | "body" = "body"
> = {
  [key in KeysWithMethod<TypedRoutes, Method>]: Method extends keyof TypedRoutes[key]
    ? GetRouteResponseInfo<TypedRoutes, key, Method>
    : // ? Info extends "body"
      //   ? GetRouteResponseInfo<TypedRoutes, key, Method, Info>
      //   : GetRouteResponseInfo<TypedRoutes, key, Method>
      never;
};

// // usage

type GetRoutesInfo<
  Path extends keyof TypedRoutes,
  Method extends keyof TypedRoutes[Path],
  Info extends keyof GetRouteResponseInfoHelper<TypedRoutes, Path, Method> | "body" = "body"
> = GetRouteResponseInfo<TypedRoutes, Path, Method, Info>;

type HomeResponse = GetRoutesInfo<"/nested/", "post", "json">;

// usage
// get all routes that have a "get" method, and their response types
type GetRoutes = RoutesWithMethod<"get">;
//   ^?
// get all routes that have a "post" method, and their response types
type PostRoutes = RoutesWithMethod<"post">;
//   ^?
////

type OnlyString<T> = T extends string ? T : never;
type FlatKeyof<T> = OnlyString<keyof T>;

type NestedRouter = TypedRouter<{
  "/": { get: any };
  "/xxx": { get: any };
  // "/router": TypedRouter<{ "/": { post: (req,res)=>{}, } }>;
  "/router": TypedRouter<{ "/111": any; "/555": any; "/doubleNested": TypedRouter<{ "/kk": { all: any } }> }>;
  "/xxxqq": TypedRouter<{ "/": any; "/555": any; "/doubleNested": TypedRouter<{ "/kk": { all: any } }> }>;
}>;

type st5 = FlatNestedRouters<NestedRouter["routes"]>;
type st5_122 = st5["/xxx"];

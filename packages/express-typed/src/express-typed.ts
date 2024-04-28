import express, { Request, Response, NextFunction } from "express";

// Patches the Response object with extra information, so that can later be extracted
export type TypedResponse<Res extends any[] = []> = {
  status<const T>(arg: T): TypedResponse<[...Res, { status: T }]>;
  links<const T>(arg: T): TypedResponse<[...Res, { links: T }]>;
  sendStatus<const T>(arg: T): TypedResponse<[...Res, { sendStatus: T }]>;
  contentType<const T>(arg: T): TypedResponse<[...Res, { contentType: T }]>;
  type<const T>(arg: T): TypedResponse<[...Res, { type: T }]>;
  format<const T>(arg: T): TypedResponse<[...Res, { format: T }]>;
  attachment<const T>(arg: T): TypedResponse<[...Res, { attachment: T }]>;

  json<const T>(arg: T): TypedResponse<[...Res, { json: T }]>;
  jsonp<const T>(arg: T): TypedResponse<[...Res, { jsonp: T }]>;
  send<const T>(arg: T): TypedResponse<[...Res, { send: T }]>;
} & Response;

// The different methods that can be used to send a response, those have special meaning
export type SendMethod = "send" | "json" | "jsonp";

export type TypedRequest<Req extends any[] = []> = {} & Request;

// The different methods that can be used to handle a request
export type HandlerMethods = "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head";

/**
 * TypedRouter is a type-safe wrapper for Express Router.
 */
export class TypedRouter<
  R extends {
    [K in string]: R[K] extends TypedRouter<infer N>
      ? TypedRouter<N>
      :
          | {
              [key in HandlerMethods]?: (req: TypedRequest, res: TypedResponse, next: NextFunction) => void;
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

// extract any relevant information from TypedRouter, and flatten any nested routers
export type ParseRoutes<T extends TypedRouter<any>> = FlatNestedRouters<T["routes"]>;

// flatten any nested routers
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

// https://stackoverflow.com/a/50375286/12371242
export type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

/**
 * Get the response info for a given route and method
 * for example
 *    GetRouteResponseInfoHelper<typeof typedRouter, "/", "get"> might return { status: 200, send: "Hello world" }
 */
export type GetRouteResponseInfoHelper<
  Router extends TypedRouter<any>["routes"],
  Path extends keyof Router,
  Method extends keyof Router[Path]
> = UnionToIntersection<
  (
    ReturnType<Router[Path][Method] extends (...args: any) => any ? Router[Path][Method] : never> extends
      | TypedResponse<infer Res>
      | Promise<TypedResponse<infer Res>>
      ? Res
      : never
  ) extends (infer U)[]
    ? U
    : never
>;

/**
 * Get the response info for a given route, method, and info type
 * for example
 *  - GetRouteResponseInfo<typeof typedRouter, "/", "get"> might return "Hello world"
 *  - GetRouteResponseInfo<typeof typedRouter, "/", "get", "status"> might return 200
 */
export type GetRouteResponseInfo<
  Router extends TypedRouter<any>["routes"],
  Path extends keyof Router,
  Method extends keyof Router[Path],
  Info extends keyof GetRouteResponseInfoHelper<Router, Path, Method> | "body" = "body"
  // Info extends "body" | undefined = undefined
> = Info extends "body"
  ? GetRouteResponseInfoHelper<Router, Path, Method>[Extract<keyof GetRouteResponseInfoHelper<Router, Path, Method>, SendMethod>]
  : Info extends keyof GetRouteResponseInfoHelper<Router, Path, Method>
  ? GetRouteResponseInfoHelper<Router, Path, Method>[Info]
  : GetRouteResponseInfoHelper<Router, Path, Method>;

/**
 * Get all the keys in the router that have a specific method
 * for example, KeysWithMethod<typeof typedRouter, "get"> might return "/" | "/nested"
 */
export type KeysWithMethod<Router extends TypedRouter<any>["routes"], Method extends GetRouterMethods<Router>> = {
  [K in keyof Router]: Method extends keyof Router[K] ? K : never;
}[keyof Router];

/**
 * Get all the existing methods for any endpoint in the router
 * for example, GetRouterMethods<typeof typedRouter> might return "get" | "post" | "all" or something similar, if those are the methods are defined on some of the endpoints in the router
 */
export type GetRouterMethods<Router extends TypedRouter<any>["routes"]> = keyof UnionToIntersection<Router[keyof Router]>;

/**
 * Get all the routes in the router that have a specific method
 * for example, GetRoutesWithMethod<typeof typedRouter, "get"> might return { "/": "Hello world", "/nested": "get /nested/" }
 */
export type GetRoutesWithMethod<Router extends TypedRouter<any>["routes"], Method extends GetRouterMethods<Router>> = {
  [Path in KeysWithMethod<Router, Method>]: Method extends keyof Router[Path] ? GetRouteResponseInfo<Router, Path, Method> : never;
};

import express, { Request, Response, NextFunction } from "express";
// import type {Query} from "express-serve-static-core";
import { DefaultIfUnknown, FilterUnknown, OnlyString, UnionToIntersection, WithDefault } from "./type-utils";

// Patches the Response object with extra information, so that can later be extracted
export type TypedResponseRes = { body: any; locals: Record<string, any>; routes: any };
export type TypedResponse<Res extends Partial<TypedResponseRes> = TypedResponseRes, Info extends any[] = []> = {
  status<const T extends Res["body"]>(arg: T): TypedResponse<Res, [...Info, { status: T }]>;
  links<const T extends Res["body"]>(arg: T): TypedResponse<Res, [...Info, { links: T }]>;
  sendStatus<const T extends Res["body"]>(arg: T): TypedResponse<Res, [...Info, { sendStatus: T }]>;
  contentType<const T extends Res["body"]>(arg: T): TypedResponse<Res, [...Info, { contentType: T }]>;
  type<const T extends Res["body"]>(arg: T): TypedResponse<Res, [...Info, { type: T }]>;
  format<const T extends Res["body"]>(arg: T): TypedResponse<Res, [...Info, { format: T }]>;
  attachment<const T extends Res["body"]>(arg: T): TypedResponse<Res, [...Info, { attachment: T }]>;

  json<const T extends Res["body"]>(arg: T): TypedResponse<Res, [...Info, { json: T }]>;
  jsonp<const T extends Res["body"]>(arg: T): TypedResponse<Res, [...Info, { jsonp: T }]>;
  send<const T extends Res["body"]>(arg: T): TypedResponse<Res, [...Info, { send: T }]>;
} & Response<Res["body"], WithDefault<Res["locals"], Record<string, any>>>;

// The different methods that can be used to send a response, those have special meaning
export type SendMethod = "send" | "json" | "jsonp";

// Patches the Request object with extra information, so that can later be extracted
export type TypedRequestReq = {
  body: any;
  query: any; // todo: make it Record<string, any> (casing error `Types of property 'query' are incompatible` between TypedRequest["query"] and Request["query"])
  params: Record<string, any>;
};
export type TypedRequest<Req extends Partial<TypedRequestReq> = TypedRequestReq> = {
  // body: unknown extends Req["body"]?any:Req["body"];
  // body: WithDefault<Req["body"],any>;
  body: DefaultIfUnknown<Req["body"], any>;
  query: DefaultIfUnknown<Req["query"], any>;
  params: DefaultIfUnknown<Req["params"], Record<string, any>>;
} & Omit<Request<Record<string, string>, Req["body"], any, Req["query"], Record<string, any>>, "body">;

// The different methods that can be used to handle a request
export type HandlerMethods = "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head";

/**
 * TypedRouter is a type-safe wrapper for Express Router.
 */
export class TypedRouter<
  R extends {
    // [Path in OnlyString<keyof FlatNestedRouters<R>>]: FlatNestedRouters<R>[Path]
    [Path in string]: R[Path] extends TypedRouter<infer N>
      ? TypedRouter<N>
      :
          | {
              [H in HandlerMethods]?: (
                req: TypedRequest, // todo: add contraint to TypedRequest about params, TypedRequest<{ params: { [key in ExtractRouteParams<Path>]: string } }> (currently it's imposible because it requires `Path keyof R` instead of `Path in string`, and that's would break nested routers in the current way that R type is enforced)
                res: TypedResponse,
                next: NextFunction
              ) => void;
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

// This alias is only to make sure a given T is valid flat TypedRouter (no nested routers)
export type FlatTypedRouter = {
  [Path in string]: {
    [H in HandlerMethods]?: (req: TypedRequest, res: TypedResponse, next: NextFunction) => void;
  };
};

// extract any relevant information from TypedRouter, and flatten any nested routers
export type ParseRoutes<T extends TypedRouter<any>> = FlatNestedRouters<T["routes"]>;

// flatten any nested routers
export type FlatNestedRouters<R> = {
  [K in keyof R]: K extends string
    ? (
        x: R[K] extends TypedRouter<infer N>
          ? FlatNestedRouters<{ [K2 in OnlyString<keyof N> as `${K}${K2}`]: N[K2] }>
          : // FlatNestedRouters<{ [K2 in keyof N extends string ? `${keyof N}` : "" as `${K}${K2}`]: N[K2] }>
            Pick<R, K>
      ) => void
    : never;
} extends { [k: string]: (x: infer I) => void }
  ? { [K in keyof I]: I[K] }
  : never;

// export type FlatNestedRoutersNew<R> = {
//    [K in keyof R]: K extends string

// }

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
      | TypedResponse<infer Res, infer Info>
      | Promise<TypedResponse<infer Res, infer Info>>
      ? Info
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
 * Get the actual request type for a given route
 * for example
 * - GetRouteRequest<typeof typedRouter, "/", "get"> might return { body: { name: string } }
 */
export type GetRouteRequestHelper<
  Router extends TypedRouter<any>["routes"],
  Path extends keyof Router,
  Method extends keyof Router[Path]
> = Router[Path][Method] extends (req: infer Req, res: any) => any ? FilterUnknown<Req> : never;

/**
 * Get the  certain info from request type for a given route, default is "body"
 * for example
 * - GetRouteRequest<typeof typedRouter, "/", "get"> might return { name: string }
 */
export type GetRouteRequest<
  Router extends TypedRouter<any>["routes"],
  Path extends keyof Router,
  Method extends keyof Router[Path],
  Info extends keyof GetRouteRequestHelper<Router, Path, Method> = Extract<keyof GetRouteRequestHelper<Router, Path, Method>, "body">
> = GetRouteRequestHelper<Router, Path, Method> extends { [K in Info]?: infer T } ? T : never;

/**
 * Get all the paths in the router that have a specific method,
 * for example, GetRoutesWithMethodHelper<typeof typedRouter, "get"> might return "/" | "/nested"
 */
export type KeysWithMethod<Router extends TypedRouter<any>["routes"], Method extends GetRouterMethods<Router>> = {
  [K in keyof Router]: Method extends keyof Router[K] ? K : never;
}[keyof Router];

/**
 * Get all the existing methods for any endpoint in the router,
 * for example, GetRouterMethods<typeof typedRouter> might return "get" | "post" | "all" or something similar, if those are the methods are defined on some of the endpoints in the router
 */
export type GetRouterMethods<Router extends TypedRouter<any>["routes"]> = keyof UnionToIntersection<Router[keyof Router]>;

/**
 * Get all the routes in the router that have a specific method,
 * for example, GetRoutesWithMethod<typeof typedRouter, "get"> might return { "/": "Hello world", "/nested": "get /nested/" }
 */
export type GetRoutesWithMethod<Router extends TypedRouter<any>["routes"], Method extends GetRouterMethods<Router>> = {
  [Path in KeysWithMethod<Router, Method>]: Method extends keyof Router[Path] ? GetRouteResponseInfo<Router, Path, Method> : never;
};

/**
 * Get the response info for a given route and method
 * for example
 *  ExtractRouteParams<"/123/:title/:id"> returns "title" | "id"
 */
export type ExtractRouteParams<Path extends string> = Path extends `${infer Start}/:${infer Param}/${infer Rest}`
  ? Param | ExtractRouteParams<`/${Rest}`>
  : Path extends `${infer Start}/:${infer Param}`
  ? Param
  : never;

/**
 * Interpolates route parameters into a string
 * for example
 *  - InterpolateRouteParamsIntoStrings<"/123/:title/:id"> returns `/123/${string}/${string}`
 */
export type InterpolateRouteParamsIntoStrings<S extends string> = S extends `${infer Start}:${infer Param}/${infer Rest}`
  ? `${Start}${string}/${InterpolateRouteParamsIntoStrings<Rest>}`
  : S extends `${infer Start}:${infer Param}`
  ? `${Start}${string}`
  : S;

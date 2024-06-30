import express, { Request, Response, NextFunction } from "express";
import { UnionToIntersection, WithDefault } from "./type-utils";
import { RouteParameters } from "express-serve-static-core";

// Patches the Response object with extra information, so that can later be extracted
export type TypedResponse<Res extends Partial<TypedResponseOptions> = TypedResponseOptions, Info extends any[] = []> = {
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

export type TypedResponseOptions = { body: unknown; locals: Record<string, unknown>; routes: unknown };

// The different methods that can be used to send a response, those have special meaning
export type SendMethod = "send" | "json" | "jsonp";

export type TypedRequestOptions = { body: unknown; query: unknown; params: unknown };

export type TypedRequest<ReqInfo extends Partial<TypedRequestOptions> = TypedRequestOptions> = {
  body: ReqInfo["body"];
  query: ReqInfo["query"];
  params: ReqInfo["params"];
}; //& Omit<Request, "body">;

// The different methods that can be used to handle a request
export type HandlerMethods = "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head";

class MyClass {}

// const made = new MyClass();

// export type InferA<T extends (req, res) => any> = T extends (req: infer Req, res: any) => any ? Req : never;

export type Handler = (req: TypedRequest, res: TypedResponse, next: NextFunction) => void;

export type RouteHandler<OriginRoute extends string> = {
  [HandlerName in HandlerMethods]?: Handler;
  // [HandlerName in HandlerMethods]?: (req: TypedRequest<{params:RouteParameters<OriginRoute>}>, res: TypedResponse, next: NextFunction) => void;
};

export type TypedRoutes<Routes> = {
  // export type TypedRoutes<Routes extends TypedRoutes<Routes>> = {
  [Route in OnlyString<keyof Routes>]: Routes[Route] extends TypedRouter<infer N>
    ? TypedRouter<N>
    : // : {
      //     [HandlerName in HandlerMethods]?: HandlerName extends keyof Routes[Route]
      //       ? // [HandlerName in keyof Routes[Route]]?: HandlerName extends HandlerMethods
      //         // route handler should be a function
      //         Routes[Route][HandlerName] extends (req: any, res: any, next: any) => void
      //         ? // from now route handler is a function
      //           // check if handler args (req,res,next) are correct as TypedRequest, TypedResponse, NextFunction
      //           Routes[Route][HandlerName] extends (req: TypedRequest, res: TypedResponse, next?: NextFunction) => void
      //           ? // if so try to infer the request info
      //             Routes[Route][HandlerName] extends (
      //               req: TypedRequest<infer ReqInfo>,
      //               res: TypedResponse<infer Resinfo>,
      //               next: NextFunction
      //             ) => void
      //             ? (req: TypedRequest<ReqInfo>, res: TypedResponse<Resinfo>, next?: NextFunction) => void
      //             : "handler should be of type Handler"
      //           : // if function -> it least enforce TypedRequest, TypedResponse, NextFunction
      //             (req?: TypedRequest, res?: TypedResponse, next?: NextFunction) => void
      //         : (req?: any, res?: any, next?: any) => void // `${HandlerName} handler should be a function`
      //       : never;
      //   };

      // {
      //   [HandlerName in HandlerMethods]?: HandlerName extends keyof Routes[Route]
      //     ? Routes[Route][HandlerName] extends (
      //         req: TypedRequest<infer ReqInfo>,
      //         res: TypedResponse<infer Resinfo>,
      //         next: NextFunction
      //       ) => void
      //       ? (req: TypedRequest<ReqInfo>, res: TypedResponse<Resinfo>, next: NextFunction) => void
      //       : (req: TypedRequest, res: TypedResponse, next: NextFunction) => void // `${HandlerName} handler should be a function`
      //     : never;
      // };

      {
        [HandlerName in HandlerMethods]?: HandlerName extends keyof Routes[Route]
          ? Routes[Route][HandlerName] extends (
              req: TypedRequest<infer ReqInfo>,
              res: TypedResponse<infer Resinfo>,
              next: NextFunction
            ) => void
            ? (req: TypedRequest<ReqInfo & { params: RouteParameters<Route> }>, res: TypedResponse<Resinfo>, next: NextFunction) => void
            : // (
              //   req: ReqInfo extends { params?: RouteParameters<Route> } ? ReqInfo : "error",
              //   res: TypedResponse<Resinfo>,
              //   next: NextFunction
              // ) => void
              never //(req: TypedRequest, res: TypedResponse, next: NextFunction) => void // `${HandlerName} handler should be a function`
          : never;
      };
};

type OnlyString<T> = T extends string ? T : never;

/**
 * TypedRouter is a type-safe wrapper for Express Router.
 */
export class TypedRouter<R extends TypedRoutes<R>> {
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
type StringOnly<T> = T extends string ? T : never;

// extract any relevant information from TypedRouter, and flatten any nested routers
export type ParseRoutes<T extends TypedRouter<any>> = TypedRoutes<FlatNestedRouters<T["routes"]>>;

// export type FlatRoute<Routes> = {
//   [Route in keyof Routes]: (
//     x: Routes[Route] extends TypedRouter<infer NestedRoutes>
//       ? // flat any nested routes recursively
//         FlatRoute<{
//           // re-map nested routes strins to be prefixed with parent route
//           [NestedRoute in keyof NestedRoutes as `${StringOnly<Route>}${StringOnly<NestedRoute>}`]: NestedRoutes[NestedRoute];
//         }>
//       : Pick<Routes, Route>
//   ) => void;
//   // trick to re-map keys into union of intersections using function arguments (see https://stackoverflow.com/questions/78364892/typescript-how-to-flatten-nested-generic-type-into-parent-generic-type)
// } extends { [k: string]: (x: infer I) => void }
//   ? { [K in keyof I]: I[K] }
//   : never;

// flatten any nested routers
// export type FlatNestedRouters<Routes extends TypedRoutes<any>> = {
export type FlatNestedRouters<Routes> = {
  [Route in keyof Routes]: (
    x: Routes[Route] extends TypedRouter<infer NestedRoutes>
      ? // flat any nested routes recursively
        FlatNestedRouters<{
          // re-map nested routes strins to be prefixed with parent route
          // [NestedRoute in keyof NestedRoutes]: any;
          [NestedRoute in keyof NestedRoutes as `${StringOnly<Route>}${StringOnly<NestedRoute>}`]: NestedRoutes[NestedRoute];
        }>
      : Pick<Routes, Route>
  ) => void;
  // trick to re-map keys into union of intersections using function arguments (see https://stackoverflow.com/questions/78364892/typescript-how-to-flatten-nested-generic-type-into-parent-generic-type)
} extends { [k: string]: (x: infer I) => void }
  ? { [K in keyof I]: I[K] }
  : never;

// // flatten any nested routers
// export type FlatNestedRouters<T> = {
//   [K in keyof T]: K extends string
//     ? (
//         x: T[K] extends TypedRouter<infer N extends TypedRoutes<any>>
//           ? FlatNestedRouters<{ [K2 in keyof N extends string ? `${keyof N}` : "" as `${K}${K2}`]: N[K2] }>
//           : Pick<T, K>
//       ) => void
//     : never;
// } extends { [k: string]: (x: infer I) => void }
//   ? { [K in keyof I]: I[K] }
//   : never;

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

type FilterUnknown<T> = {
  [K in keyof T as unknown extends T[K] ? never : K]: T[K];
};

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

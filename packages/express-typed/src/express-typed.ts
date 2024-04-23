import express from "express";
import type { Request, Response, NextFunction } from "express-serve-static-core";

export type IHandlerResponse<Res extends any[] = []> = {
  status<T>(arg: T): IHandlerResponse<[...Res, { status: T }]>;
  links<const T>(arg: T): IHandlerResponse<[...Res, { links: T }]>;
  sendStatus<const T>(arg: T): IHandlerResponse<[...Res, { sendStatus: T }]>;
  contentType<const T>(arg: T): IHandlerResponse<[...Res, { contentType: T }]>;
  type<const T>(arg: T): IHandlerResponse<[...Res, { type: T }]>;
  format<const T>(arg: T): IHandlerResponse<[...Res, { format: T }]>;
  attachment<const T>(arg: T): IHandlerResponse<[...Res, { attachment: T }]>;

  json<const T>(arg: T): IHandlerResponse<[...Res, { json: SendRes<T> }]>;
  jsonp<const T>(arg: T): IHandlerResponse<[...Res, { jsonp: SendRes<T> }]>;
  send<const T>(arg: T): IHandlerResponse<[...Res, { send: SendRes<T> }]>;
} & Response;

type SendRes<T> = { _sentResponse: T };

export type IHandlerRequest<Req extends any[] = []> = {} & Request<infer K>;

export type HandlerMethods = "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head";

// todo: support nested routes

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

// type Test<R extends Record<string, Partial<Record<HandlerMethods, (req: IHandlerRequest, res: IHandlerResponse, next: NextFunction) => void>>>> = {
//   [K in keyof R]: {
//     [P in keyof R[K]]: P extends HandlerMethods ? R[K][P] : never;
//   };
// };
// type Exactly<T, U> = T & Record<Exclude<keyof U, keyof T>, never>;
// type Exactly<T, U extends T> = { [K in keyof U]: K extends keyof T ? T[K] : never };

type StrictPartial<T> = {
  [P in keyof T]?: T[P];
};
// type t1 = Test<{ "/": { get: any } }>;
type Test2<R> = R extends Record<infer P extends string, infer K>
  ? K extends Partial<Record<HandlerMethods, (req?: IHandlerRequest, res?: IHandlerResponse, next?: NextFunction) => void>>
    ? { [key in P]: K } // this is Routes mapping such as { "/": { get: (req,res)=>any } }
    : K extends TypedRouter<infer R>
    ? R["routes"]
    : never
  : never;

type Handler = (req?: IHandlerRequest, res?: IHandlerResponse, next?: NextFunction) => void;

type Test3<R> = R extends {
  [Path in string]:
    | {
        [K in HandlerMethods]?: (req?: IHandlerRequest, res?: IHandlerResponse, next?: NextFunction) => void;
      }
    | TypedRouter<any>;
}
  ? R
  : never;

type Test4<R> = R extends {
  [key: string]: infer H;
}
  ? {
      [P in keyof R]: H extends { [M in HandlerMethods]?: any } ? H : H extends TypedRouter<any> ? H : never;
    }
  : never;

type Test5<R> = R extends {
  [key: string]: infer H;
}
  ? {
      [P in keyof R as string]: H extends { [M in HandlerMethods]?: any }
        ? H
        : H extends TypedRouter<infer NestedR>
        ? TypedRouter<NestedR, P & string>
        : never;
    }
  : never;

type SpreadRouters<Router> = Router extends TypedRouter<infer Routes>
  ? {
      // [Route in keyof Routes]: Routes[Route] extends Handler ? Handler : never;
      [Route in keyof Routes & string]: Routes[Route] extends { [M in HandlerMethods]?: any }
        ? Routes[Route]
        : Routes[Route] extends TypedRouter<infer NestedRoutes>
        ? SpreadRouters<TypedRouter<NestedRoutes, Route>>
        : never;
    }
  : never;

// type SpreadRoutes<Router> = Router extends TypedRouter<infer Routes>? {[Route in keyof Routes]:Routes[Route]} : never;
// type SpreadRoutes<R> = R extends TypedRouter<infer Routes>
//   ? {
//       [P in keyof Routes as P extends string
//         ? Routes[P] extends TypedRouter<any>
//           ? `${P}${string & keyof SpreadRoutes<Routes[P]>}`
//           : P
//         : never]: Routes[P] extends TypedRouter<any>
//         ? SpreadRoutes<Routes[P]>
//         : Routes[P];
//     }
//   : never;

type ResolveRouteKeys<Routes, P extends keyof Routes> = P extends string
  ? Routes[P] extends TypedRouter<infer Nested>
    ? `${P}${keyof Nested extends string ? `${keyof Nested}` : ""}`
    : P // this retrun branch is for non-nested routes route keys
  : never;

type OnlyString<T> = T extends string ? T : never;
type FlatKeyof<T> = OnlyString<keyof T>;

type SpreadRoutes<R> = R extends TypedRouter<infer Routes>
  ? {
      [P in keyof Routes as ResolveRouteKeys<Routes, P>]: P extends string
        ? Routes[P] extends TypedRouter<infer Nested>
          ? // this is for nested routes values
            // `${OnlyString<P>}${ResolveRouteKeys<Routes[P], keyof Nested>}` extends ResolveRouteKeys<Routes, infer K>?P:'2'
            // `${OnlyString<P>}${FlatKeyof<N>}` extends `${OnlyString<P>}${infer K}`?K:never
            `${P}${keyof Nested extends string ? `${keyof Nested}` : ""}`
          : Routes[P] // this is for non-nested routes values
        : never;
    }
  : never;
// type SpreadRoutes2<R> = R extends TypedRouter<infer Routes>
//   ? {
//       [P in keyof Routes]: Routes[P] extends TypedRouter<any>
//         ? // this is for nested routes values
//           SpreadRoutes2<Routes[P]> & Routes
//         : Routes[P]; // this is for non-nested routes values
//     }
//   : never;
// type FlattenRoutes<T, K extends string = ""> = T extends TypedRouter<infer R>
//   ? { [P in keyof R & string as `${K}${P extends "" ? "" : "/"}${P}`]: FlattenRoutes<R[P], `${K}${P extends "" ? "" : "/"}${P}`> }
//   : T;

// type SpreadRoutes<T> = {
//   [K in keyof FlattenRoutes<T>]: FlattenRoutes<T>[K] extends TypedRouter<infer R> ? never : FlattenRoutes<T>[K]
// };

// Results in type Flags = { 'key-option1': boolean, 'key-option2': boolean }
type test = { [key: string]: any; 10: "test" } extends { [key: string]: any } ? true : false;

type NestedRouter = TypedRouter<{
  "/": { get: any };
  "/router": TypedRouter<{ "/111": 111; "/555": 555; "/doubleNested": TypedRouter<{ "/kk": "some nested val" }> }>;
  "/xxx": "zz";
}>;

type st1 = SpreadRouters<TypedRouter<{ "/": { get: any } }>>;
type st2 = SpreadRouters<NestedRouter>;
type st3 = SpreadRoutes<NestedRouter>;
type st4 = SpreadRoutes2<NestedRouter>;
type st31 = st3["/router/12"];

type FlatNestedRouters<T> = {
  [K in keyof T & string]: (
    x: T[K] extends TypedRouter<infer N> ? FlatNestedRouters<{ [K2 in keyof N & string as `${K}${K2}`]: N[K2] }> : Pick<T, K>
  ) => void;
} extends { [k: string]: (x: infer I) => void }
  ? { [K in keyof I]: I[K] }
  : never;

type st5 = FlatNestedRouters<NestedRouter["routes"]>;

// type t2 = Test2<{ "/": { get: any }; "/post": { post: any }; "/another": { put: any } }>;
// type t3 = Test3<{ "/": { get: any }; "/router": TypedRouter<{ "/": any }> }>;
// type t4 = Test4<{ "/": { get: any }; "/router": TypedRouter<{ "/": any }> }>;
// type t5 = Test5<{ "/": { get: any }; "/router": TypedRouter<{ "/": any }> }>;

type OriginalType = {
  prop1: string;
  prop2: number;
};

type RenamedType = {
  [K in keyof OriginalType as `renamed_${K}`]: OriginalType[K];
};

type CombinedType = OriginalType & RenamedType;

// The CombinedType will have both the original and renamed properties:
// {
//   prop1: string;
//   prop2: number;
//   renamed_prop1: string;
//   renamed_prop2: number;
// }
export class TypedRouter<
  R extends Record<
    string,
    Partial<Record<HandlerMethods, (req: IHandlerRequest, res: IHandlerResponse, next: NextFunction) => void>> | TypedRouter<any>
  >
  // Prefix extends string = ""
  // R extends {
  //   [key: string]: {
  //     [key in HandlerMethods]?: (req: IHandlerRequest, res: IHandlerResponse, next: NextFunction) => void;
  //   };
  // },
> {
  router: express.Router;
  routes: R;

  constructor(routes: R) {
    this.router = express.Router();
    this.routes = routes;

    for (const path in this.routes) {
      for (const method in this.routes[path]) {
        const route = this.routes[path];
        if (route instanceof express.Router) {
          this.router.use(path, route as any);
        } else {
          (this.router as any)[method](path, this.routes[path][method]);
        }
      }
    }
  }
}

type Keys = "option1" | "option2";
type Flags = { [K in Keys as `key-${K}`]: boolean };
// Results in type Flags = { 'key-option1': boolean, 'key-option2': boolean }

export type GetRoutesInfo<T extends TypedRouter<any>> = T["routes"];

export type GetRouteResponseInfo<
  Router extends TypedRouter<any>,
  Path extends keyof Router["routes"],
  Method extends keyof Router["routes"][Path]
> = ReturnType<Router["routes"][Path][Method]> extends IHandlerResponse<infer Res> ? Res : never;

export type InferRes<T> = T extends (infer U)[]
  ? U extends Record<any, infer R extends SendRes<any>>
    ? R["_sentResponse"]
    : never
  : never;

export type KeysWithMethod<T, Method extends string> = {
  [K in keyof T]: Method extends keyof T[K] ? K : never;
}[keyof T];

// // Usage
// type ExampleType = {
//   prop1: string;
//   prop2: number;
//   prop3: boolean;
// };

// type PartialExampleType = StrictPartial<ExampleType>; // { prop1?: string; prop2?: number; prop3?: boolean; }

// ////////////////
// // example usage
// const router = express.Router();
// router.post("/", async (req, res, next) => {
//   res.send(req.body).status(200);
// });

// const typedRouter = new TypedRouter({
//   "/": {
//     get: (req, res) => {
//       const test = res.send("Typesafe Route!").status(200);
//       return test;
//     },
//   },
//   "/test": {
//     get: (req, res) => {
//       return res.json({ message: 123 }).status(200).send("test");
//     },
//     post: (req, res) => {
//       return res.send("post res!").status(200);
//     },
//   },
//   "post-only": {
//     post: (req, res) => {
//       return res.send("post only res!").status(200);
//     },
//   },
// });

// export type TypedRoutes = GetRoutesInfo<typeof typedRouter>;

// export type RouteResolver<Path extends keyof TypedRoutes, Method extends keyof TypedRoutes[Path]> = GetRouteResponseInfo<
//   typeof typedRouter,
//   Path,
//   Method
// >;
// export type RouteResponseResolver<Path extends keyof TypedRoutes, Method extends keyof TypedRoutes[Path]> = InferRes<
//   GetRouteResponseInfo<typeof typedRouter, Path, Method>
// >;

// export type RoutesWithMethod<Method extends HandlerMethods> = {
//   [key in KeysWithMethod<TypedRoutes, Method>]: Method extends keyof TypedRoutes[key] ? RouteResponseResolver<key, Method> : never;
// };

// // usage
// type HomeRouteInfo = RouteResolver<"/", "get">;
// type HomeRouteResponse = RouteResponseResolver<"/", "get">;
// type GetRoutesWithPostMethod = RoutesWithMethod<"get">;

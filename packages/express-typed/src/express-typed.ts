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

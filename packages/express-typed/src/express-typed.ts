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

export type IHandlerRequest<Req extends any[] = []> = {} & Request;

export type HandlerMethods = "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head";

export class TypedRouter<
  R extends {
    [key: string]: {
      [key in HandlerMethods]?: (req: IHandlerRequest, res: IHandlerResponse, next: NextFunction) => void;
    };
  }
> {
  router: express.Router;
  routes: R;

  constructor(routes: R) {
    this.router = express.Router();
    this.routes = routes;
    for (const path in this.routes) {
      for (const method in this.routes[path]) {
        (this.router as any)[method](path, this.routes[path][method]);
      }
    }
  }
}

// export type GetRoutes<T extends TypedRouter<any>> = keyof T["routes"];

// example usage
const router = express.Router();
router.post("/", async (req, res, next) => {
  res.send(req.body).status(200);
});

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
      return res.send(req.body).status(200);
    },
  },
});

export type TypedRouterTypes = typeof typedRouter;

type RoutesType = TypedRouterTypes["routes"];

type ResponseResolver<T extends TypedRouter<any>> = T extends TypedRouter<infer R> ? R : never;

type GetRouteResponseInfo<
  Router extends TypedRouter<any>,
  Path extends keyof Router["routes"],
  Method extends keyof Router["routes"][Path]
> = ReturnType<Router["routes"][Path][Method]> extends IHandlerResponse<infer Res> ? Res : never;

// type InferRes<T> = T extends (infer U)[] ? (U extends Record<any, infer R extends SendRes<any>> ? R['_sentResponse'] : never) : never;

type GetRouteResponseType<
  Router extends TypedRouter<any>,
  Path extends keyof Router["routes"],
  Method extends keyof Router["routes"][Path]
> = InferRes<ReturnType<Router["routes"][Path][Method]>>;

type t1 = GetRouteResponseInfo<typeof typedRouter, "/test", "get">;
type InferRes<T> = T extends (infer U)[] ? (U extends Record<any, infer R extends SendRes<any>> ? R['_sentResponse'] : never) : never;
type t2 = InferRes<t1>;
type t3 = GetRouteResponseType<typeof typedRouter, "/test", "get">;

//
// type Test = GetRouteResponse<TypedRouterTypes, "/test">;

// type arr1 = [{ send: "asd" }, { status: number }];
// type ExtractFromArray<T extends any[], K extends string | number | symbol> = T extends [{ [key in K]: infer R }, ...T]
//   ? R
//   : T extends any
//   ? ExtractFromArray<T, K>
//   : never;

// type t3 = ExtractFromArray<arr1, "status">;

// type arr1 = [{ send: '1' }, { status: '2' }, { send: 3}, { status: 4}];
// type t = ExtractFromArray<arr1, "send">; // t is number

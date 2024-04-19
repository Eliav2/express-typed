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
  },
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

export type GetRoutesInfo<T extends TypedRouter<any>> = T["routes"];

export type GetRouteResponseInfo<
  Router extends TypedRouter<any>,
  Path extends keyof Router["routes"],
  Method extends keyof Router["routes"][Path],
> = ReturnType<Router["routes"][Path][Method]> extends IHandlerResponse<infer Res> ? Res : never;

export type InferRes<T> = T extends (infer U)[]
  ? U extends Record<any, infer R extends SendRes<any>>
    ? R["_sentResponse"]
    : never
  : never;

////////////////
// example usage
// const router = express.Router();
// router.post("/", async (req, res, next) => {
//   res.send(req.body).status(200);
// });
//
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
//       return res.send(req.body).status(200);
//     },
//   },
// });
//
// type TypedRoutes = GetRoutesInfo<typeof typedRouter>;
// //   ^?
// // type TypedRoutes = {
// //   "/": {
// //       get: (req: Request<ParamsDictionary, any, any, QueryString.ParsedQs, Record<string, any>>, res: IHandlerResponse<[]>) => IHandlerResponse<...>;
// //   };
// //   "/test": {
// //       ...;
// //   };
// // }
//
// type RouteResolver<Path extends keyof TypedRoutes, Method extends keyof TypedRoutes[Path]> = GetRouteResponseInfo<
//   typeof typedRouter,
//   Path,
//   Method
// >;
// type RouteResponseResolver<Path extends keyof TypedRoutes, Method extends keyof TypedRoutes[Path]> = InferRes<
//   GetRouteResponseInfo<typeof typedRouter, Path, Method>
// >;
//
// type HomeRouteInfo = RouteResolver<"/", "get">;
// type HomeRouteResponse = RouteResponseResolver<"/", "get">;
//

import express from "express";
import type { Request, Response, NextFunction } from "express-serve-static-core";

export interface IHandlerResponse<Res extends any[] = []> extends Response {
  status<T>(arg: T): IHandlerResponse<[...Res, { status: T }]> & this;
  links<const T>(arg: T): IHandlerResponse<[...Res, { links: T }]> & this;
  sendStatus<const T>(arg: T): IHandlerResponse<[...Res, { sendStatus: T }]> & this;
  contentType<const T>(arg: T): IHandlerResponse<[...Res, { contentType: T }]> & this;
  type<const T>(arg: T): IHandlerResponse<[...Res, { type: T }]> & this;
  format<const T>(arg: T): IHandlerResponse<[...Res, { format: T }]> & this;
  attachment<const T>(arg: T): IHandlerResponse<[...Res, { attachment: T }]> & this;

  send<const T>(arg: T): IHandlerResponse<[...Res, { send: T }]> & this;
  json<const T>(arg: T): IHandlerResponse<[...Res, { json: T }]> & this;
  jsonp<const T>(arg: T): IHandlerResponse<[...Res, { jsonp: T }]> & this;
}

export interface IHandlerRequest<Res extends any[] = []> extends Request {}

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
      return res.send({ message: 123 }).status(200);
    },
    post: (req, res) => {
      return res.send(req.body).status(200);
    },
  },
});

export type TypedRouterTypes = typeof typedRouter;

type RoutesType = TypedRouterTypes["routes"];

type GetRouteResponse<
  Router extends { routes: any },
  Path extends keyof Router["routes"],
  Method extends keyof Router["routes"][Path],
> = ReturnType<Router["routes"][Path][Method]>;
type t1 = GetRouteResponse<typeof typedRouter, "/", "get">;

//
// type Test = GetRouteResponse<TypedRouterTypes, "/test">;

import { NextFunction } from "express";
import { HandlerMethods, TypedRequest, TypedRequestOptions, TypedResponse, TypedResponseOptions } from "../src/express-typed";
import express from "express";

type HandlerFunction<Req extends TypedRequestOptions = TypedRequestOptions, Res extends TypedResponseOptions = TypedResponseOptions> = (
  req: TypedRequest<Req>,
  res: TypedResponse<Res>,
  next: NextFunction
) => void;

type RouteHandler = {
  [Method in HandlerMethods]?: HandlerFunction;
};

type NestedRoutes<T> = {
  [K in keyof T]: T[K] extends TypedRouterNew<any> ? TypedRouterNew<NestedRoutes<T[K]["routes"]>> : RouteHandler;
};

export class TypedRouterNew<T extends NestedRoutes<T>> {
  router: express.Router;
  routes: T;

  constructor(routes: T) {
    this.router = express.Router();
    this.routes = routes;

    for (const path in this.routes) {
      const route = this.routes[path];
      if (route instanceof TypedRouterNew) {
        this.router.use(path, route.router);
      } else {
        for (const method in route) {
          if (isHandlerMethods(method)) {
            this.router[method](path, route[method] as any);
          } else {
            throw new Error(`Method ${method} is not a valid method`);
          }
        }
      }
    }
  }
}

const RN5 = new TypedRouterNew({
  "/nested1": new TypedRouterNew({
    "/test": {
      get: (req, res, next) => {},
    },
    "/nested2": new TypedRouterNew({
      "/test": {
        get: (req, res, next) => {},
      },
      "/nested3": new TypedRouterNew({
        "/test": {
          get: (req, res, next) => {},
        },
      }),
    }),
  }),

  "/not-typed": {
    get: (req, res, next) => {
      const a = req.params;
    },
  },

  "/:someParam": {
    get: (req, res, next) => {
      // @ts-expect-error
      const error = req.params.error;
      const param = req.params.someParam;
    },
  },

  "/typed": {
    get: (req: TypedRequest<{ body: {} }>, res, next) => {
      const a = req.params;
    },
  },
});

import express from "express";
import {Request, Response} from "express-serve-static-core";

// interface SafeRequest extends Request {}

export class Handler<Res extends any[] = []> {
  constructor() {}

  put<const T>(arg: T): Handler<[...Res, { put: T }]> {
    return new Handler();
  }

  post<const T>(arg: T): Handler<[...Res, { post: T }]> {
    return new Handler();
  }

  send<const T>(arg: T): Handler<[...Res, { send: T }]> {
    return new Handler();
  }
  status<const T>(arg: T): Handler<[...Res, { status: T }]> {
    return new Handler();
  }
}

export type HandlerNames = "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head";

export class TypedRouter<
  R extends { [key: string]: { [key in HandlerNames]?: (req: Handler, res: Handler) => any } }
  //   todo: how to make req and res both handlers and also have the correct type?
  //    Handlers store the generic types correctly but how to make the req and res have the same type?
  // R extends { [key: string]: { [key in HandlerNames]?: (req: Request, res: Response) => any } }
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
// const router = express.Router();
// router.post("/", async (req, res) => {
//     res.send(req.body).status(200);
// })
// const typedRouter = new TypedRouter({
//   "/": {
//     get: (req, res) => {
//       return res.send("Typesafe Route!").status(200);
//     },
//   },
//   "/test": {
//     get: (req, res) => {
//       return res.send({ message: 123 }).status(200);
//     },
//     post: (req, res) => {
//       return res.send(req.body).status(200);
//     },
//   },
// });
//
// export type TypedRouterTypes = typeof typedRouter;
//
// type RoutesType = GetRoutes<TypedRouterTypes>;
//
// type GetRouteResponse<T extends TypedRouter<any>, K extends GetRoutes<T>> = ReturnType<T["routes"][K]["get"]>;
//
// type Test = GetRouteResponse<TypedRouterTypes, "/test">;


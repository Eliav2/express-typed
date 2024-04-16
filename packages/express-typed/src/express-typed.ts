import express from "express";

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

export type ExpressHandlerNames = "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head";

export class TypedRouter<
  R extends { [key: string]: { [key in ExpressHandlerNames]?: (req: Handler, res: Handler) => any } }
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

// const typedRouter = new TypedRouter({
//   "/": {
//     get: (req, res) => {
//       return res.send("Typesafe Route!").status(200);
//     },
//   },
// });

//   const handler = new Handler();
//   const c1 = handler.send(200).post({ message: "123" });

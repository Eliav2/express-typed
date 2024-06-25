import { describe, expectTypeOf } from "vitest";
import { ParseRoutes, TypedRouter, type FlatNestedRouters } from "../src/express-typed";

const typedRouter = new TypedRouter({
  //   "/home": {
  //     get: (req, res) => {
  //       return res.send("Typesafe Route!").status(200);
  //     },
  //   },
  "/nested": new TypedRouter({
    "/": {
      get: (req, res) => {
        return res.send("get /nested/").status(200);
      },
      post: async (req, res) => {
        return res.json("test").status(200);
      },
    },
    "/all": {
      all: (req, res) => {
        return res.send("responding to all methods");
      },
    },
  }),
});

describe("FlatNestedRouters", () => {
  type Routes = typeof typedRouter;
  type FlatRoutes = FlatNestedRouters<Routes["routes"]>;
  expectTypeOf<keyof FlatRoutes>().toEqualTypeOf<"home" | "/nested/" | "/nested/all">();
});

describe("ParseRoutes", () => {
  const testRoutes: ParseRoutes<typeof typedRouter> = {
    "/home": {
      get: (req, res) => {
        return res.send("Typesafe Route!").status(200);
      },
    },
    "/nested/": {
      get: (req, res) => {
        return res.send("get /nested/").status(200);
      },
      post: async (req, res) => {
        return res.json("test").status(200);
      },
    },
    "/nested/all": {
      all: (req, res) => {
        return res.send("responding to all methods");
      },
    },
  };

  expectTypeOf<ParseRoutes<typeof typedRouter>>().toEqualTypeOf<typeof testRoutes>();
});

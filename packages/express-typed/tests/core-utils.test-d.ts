import { assertType, describe, expectTypeOf, it } from "vitest";
import { ParseRoutes, TypedRequest, TypedResponse, TypedRouter, TypedRoutes, type FlatNestedRouters } from "../src/express-typed";

describe("TypedRoutes", () => {
  it("types playground", () => {
    expectTypeOf<TypedRoutes<{}>>().toEqualTypeOf<{}>();
    // @ts-expect-error `Type 'number' is not assignable to type '(req?: any, res?: any, next?: any) => void'.ts(2344)`
    type t3 = TypedRoutes<{ "/home": { all: number } }>;

    type t4 = TypedRoutes<{ "/home": { all: () => {} } }>;

    // this still extends TypedRoutes, so we can't have a error here (typescript limitation)
    type t5 = TypedRoutes<{ "/home": { wrong_method: any; all: () => {} } }>;

    type t6 = TypedRoutes<{ "/home": { get: (req, res) => any } }>;

    // in case req,res is explicitly typed, it should be enforced

    // wrong asset type results in error
    // @ts-expect-error
    type t7_0 = TypedRoutes<{ "/home": { all: (req: number, res) => {} } }>;

    type t7 = TypedRoutes<{ "/home": { all: (req: TypedRequest, res) => {} } }>;

    type t8 = TypedRoutes<{ "/home": { all: (req: TypedRequest, res: TypedResponse) => {} } }>;

    // stricter type enforcement are inferred and applied
    type t9 = TypedRoutes<{ "/home": { get: (req: TypedRequest<{ body: number }>, res: TypedResponse) => {} } }>;
    type t10 = TypedRoutes<{ "/home": { get: (req: TypedRequest<{ body: number; params: { arg: number } }>, res: TypedResponse) => {} } }>;

    // wrong asset type results in error
    // @ts-expect-error
    type t10_e1 = TypedRoutes<{ "/home": { get: (req: TypedRequest<{ wrong_arg: any }>, res: TypedResponse) => {} } }>;

    type t11 = TypedRoutes<{ "/home": { get: (req: TypedRequest<{ body: number }>, res: TypedResponse, next: any) => {} } }>;

    // @ts-expect-error too many arguments
    type t12 = TypedRoutes<{ "/home": { get: (req: TypedRequest<{ body: number }>, res: TypedResponse, next: any, wrong: any) => {} } }>;

    type t13 = TypedRoutes<{
      "/home/:productId": { get: (req: TypedRequest<{ body: number }>, res: TypedResponse, next: any) => {} };
    }>;
  });

  it("simpleTypedRouter", () => {
    const simpleTypedRouter = new TypedRouter({
      "/home": {
        get: (req) => {
          // return res.send("Typesafe Route!").status(200);
        },
      },
    });

    type Routes = typeof simpleTypedRouter;
    type RoutesKeys = keyof Routes["routes"];
    expectTypeOf<RoutesKeys>().toEqualTypeOf<"/home">();
  });
});

describe("FlatNestedRouters", () => {
  // type FlatNestedRouters<T> = {
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

  // type FlatNestedRouters<T> = {
  //   [K in keyof T]: K extends string ? "yes" : "no";
  // };

  describe("simpleTypedRouter", () => {
    it("from const", () => {
      const simpleTypedRouter = new TypedRouter({
        "/home": {
          get: (req, res) => {
            return res.send("Typesafe Route!").status(200);
          },
        },
      });

      type Routes = typeof simpleTypedRouter;
      type FlatRoutes = FlatNestedRouters<Routes["routes"]>;
      type FlatRoutesKeys = keyof FlatRoutes;
      expectTypeOf<FlatRoutesKeys>().toEqualTypeOf<"/home">();
    });
    it("from direct type", () => {
      type Routes = {
        "/home": {
          get: (req: any, res: any) => void;
        };
      };

      type FlatRoutes = FlatNestedRouters<Routes>;
      type FlatRoutesKeys = keyof FlatRoutes;
      expectTypeOf<FlatRoutesKeys>().toEqualTypeOf<"/home">();
    });
  });
  it("mixedTypedRouter", () => {
    it("from direct type", () => {
      type Routes = {
        "/home": {
          get: (req: any, res: any) => void;
        };
        "/nested": {
          "/": {
            get: (req: any, res: any) => void;
            post: (req: any, res: any) => void;
          };
          "/all": {
            all: (req: any, res: any) => void;
          };
        };
      };

      type FlatRoutes = FlatNestedRouters<Routes>;
      type FlatRoutesKeys = keyof FlatRoutes;
      expectTypeOf<FlatRoutesKeys>().toEqualTypeOf<"/home" | "/nested/" | "/nested/all">();
    });
    it("from const", () => {
      const mixedTypedRouter = new TypedRouter({
        "/home": {
          get: (req, res) => {
            return res.send("Typesafe Route!").status(200);
          },
        },
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

      type Routes = typeof mixedTypedRouter;
      type FlatRoutes = FlatNestedRouters<Routes["routes"]>;
      type FlatRoutesKeys = keyof FlatRoutes;
      expectTypeOf<FlatRoutesKeys>().toEqualTypeOf<"/home" | "/nested/" | "/nested/all">();
    });
  });
});

describe("ParseRoutes", () => {
  const testRoutes: ParseRoutes<typeof mixedTypedRouter> = {
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

  expectTypeOf<ParseRoutes<typeof mixedTypedRouter>>().toEqualTypeOf<typeof testRoutes>();
});

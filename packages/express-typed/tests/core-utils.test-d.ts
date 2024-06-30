import { assertType, describe, expectTypeOf, it } from "vitest";
import {
  // FlatRoute,
  ParseRoutes,
  TypedRequest,
  TypedRequestOptions,
  TypedResponse,
  TypedResponseOptions,
  TypedRouter,
  TypedRoutes,
  type FlatNestedRouters,
} from "../src/express-typed";
import { NextFunction } from "express-serve-static-core";

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
    type t10_1 = Parameters<NonNullable<t10["/home"]["get"]>>[0];

    expectTypeOf<t10_1>().toEqualTypeOf<{
      body: number;
      query: unknown;
      params: {
        arg: number;
      };
    }>();

    // wrong asset type results in error
    // @ts-expect-error
    type t10_e1 = TypedRoutes<{ "/home": { get: (req: TypedRequest<{ wrong_arg: any }>, res: TypedResponse) => {} } }>;

    // @ts-expect-error too many arguments
    type t12 = TypedRoutes<{ "/home": { get: (req: TypedRequest<{ body: number }>, res: TypedResponse, next: any, wrong: any) => {} } }>;

    type t13 = TypedRoutes<{
      "/home/:productId": { get: (req: TypedRequest<{ body: number }>, res: TypedResponse, next: any) => {} };
    }>;
    type t13_1 = Parameters<NonNullable<t13["/home/:productId"]["get"]>>[0];
    expectTypeOf<t13_1>().toEqualTypeOf<{
      body: number;
      query: unknown;
      params: {
        productId: string;
      };
    }>();

    type t14 = TypedRoutes<{
      "/home/:productId": { get: (req: TypedRequest<{ params: { someExtraArg: string } }>, res: TypedResponse, next: any) => {} };
    }>;
    type t14_1 = Parameters<NonNullable<t14["/home/:productId"]["get"]>>[0];
    expectTypeOf<t14_1>().toEqualTypeOf<{
      body: unknown;
      query: unknown;
      params: {
        someExtraArg: string;
      } & {
        productId: string;
      };
    }>();

    type t15 = TypedRoutes<{}>;
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
  it("1", () => {
    type t0 = FlatNestedRouters<TypedRouter<{}>>;
    type t1 = FlatNestedRouters<{ "/home": { get: (req: any, res: any) => void } }>;
    type t2 = FlatNestedRouters<{ "/home": { get: (req: TypedRequest, res: TypedResponse) => void } }>;
    type t3 = FlatNestedRouters<{ "/home": { get: (req: TypedRequest<{ body: number }>, res: TypedResponse) => void } }>;
    type t4 = FlatNestedRouters<{
      "/home": { get: (req: TypedRequest<{ body: number; params: { arg: number } }>, res) => void };
    }>;
    type t5 = FlatNestedRouters<{
      "/home": { get: (req: TypedRequest<{ body: number; params: { arg: number } }>, res: TypedResponse) => void };
      "/some-page": { get: (req: TypedRequest<{ body: number; params: { arg: number } }>, res: TypedResponse) => void };
    }>;
    type t6 = FlatNestedRouters<{
      "/nested": TypedRouter<{
        "/": { get: (req: TypedRequest<{ body: number; params: { arg: number } }>, res: TypedResponse) => void };
      }>;
    }>;
    expectTypeOf<t1>().toEqualTypeOf<{ "/home": { get: (req: any, res: any) => void } }>();
    expectTypeOf<t2>().toEqualTypeOf<{ "/home": { get: (req: TypedRequest, res: TypedResponse) => void } }>();
    expectTypeOf<t3>().toEqualTypeOf<{ "/home": { get: (req: TypedRequest<{ body: number }>, res: TypedResponse) => void } }>();
    expectTypeOf<t4>().toEqualTypeOf<{
      "/home": { get: (req: TypedRequest<{ body: number; params: { arg: number } }>, res) => void };
    }>();
    expectTypeOf<t5>().toEqualTypeOf<{
      "/home": { get: (req: TypedRequest<{ body: number; params: { arg: number } }>, res: TypedResponse) => void };
      "/some-page": { get: (req: TypedRequest<{ body: number; params: { arg: number } }>, res: TypedResponse) => void };
    }>();
    expectTypeOf<t6>().toEqualTypeOf<{
      "/nested/": {
        get: (
          req: TypedRequest<{
            body: number;
            params: {
              arg: number;
            };
          }>,
          res: TypedResponse
        ) => void;
      };
    }>();
  });
});

describe("ParseRoutes", () => {
  it("basic and advanced usage", () => {
    type t0 = ParseRoutes<TypedRouter<{}>>;
    type t1 = ParseRoutes<TypedRouter<{ "/home": { get: (req: any, res: any) => void } }>>;
    type t2 = ParseRoutes<TypedRouter<{ "/home": { get: (req: TypedRequest, res: TypedResponse) => void } }>>;
    type t3 = ParseRoutes<TypedRouter<{ "/home": { get: (req: TypedRequest<{ body: number }>, res: TypedResponse) => void } }>>;
    type t4 = ParseRoutes<
      TypedRouter<{
        "/home": { get: (req: TypedRequest<{ body: number; params: { arg: number } }>, res) => void };
      }>
    >;
    type t5 = ParseRoutes<
      TypedRouter<{
        "/home": { get: (req: TypedRequest<{ body: number; params: { arg: number } }>, res: TypedResponse) => void };
        "/some-page": { get: (req: TypedRequest<{ body: number; params: { arg: number } }>, res: TypedResponse) => void };
      }>
    >;
    type t6 = ParseRoutes<
      TypedRouter<{
        "/nested": TypedRouter<{
          "/1": { get: (req: any, res: any) => void };
          "/2": { get: (req: TypedRequest, res: any) => void };
          "/3": { get: (req: TypedRequest, res: TypedResponse) => void };
          "/4": { get: (req: TypedRequest<{ body: number }>, res: TypedResponse) => void };
          "/5": { get: (req: TypedRequest<{ body: number; params: { arg: number } }>, res: TypedResponse) => void };
          "/6/:nestedId": { get: (req: TypedRequest<{ body: number; params: { arg: number } }>, res: TypedResponse) => void };
        }>;
      }>
    >;

    type t1_1 = t1["/home"]["get"];
    type t2_1 = t2["/home"]["get"];
    type t3_1 = t3["/home"]["get"];
    type t4_1 = t4["/home"]["get"];
    type t5_1 = t5["/home"]["get"];
    type t6_1 = t6["/nested/1"]["get"];
    type t6_2 = t6["/nested/2"]["get"];
    type t6_3 = t6["/nested/3"]["get"];
    type t6_4 = t6["/nested/4"]["get"];
    type t6_5 = t6["/nested/5"]["get"];
    type t6_6 = t6["/nested/6/:nestedId"]["get"];

    expectTypeOf<t1_1>().toEqualTypeOf<
      | ((
          req: TypedRequest<
            Partial<TypedRequestOptions> & {
              params: {};
            }
          >,
          res: TypedResponse<Partial<TypedResponseOptions>, []>,
          next: NextFunction
        ) => void)
      | undefined
    >();
    expectTypeOf<t2_1>().toEqualTypeOf<
      | ((
          req: TypedRequest<
            TypedRequestOptions & {
              params: {};
            }
          >,
          res: TypedResponse<TypedResponseOptions, []>,
          next: NextFunction
        ) => void)
      | undefined
    >();
    expectTypeOf<t3_1>().toEqualTypeOf<
      | ((
          req: TypedRequest<
            {
              body: number;
            } & {
              params: {};
            }
          >,
          res: TypedResponse<TypedResponseOptions, []>,
          next: NextFunction
        ) => void)
      | undefined
    >();

    expectTypeOf<t4_1>().toEqualTypeOf<
      | ((
          req: TypedRequest<
            {
              body: number;
              params: {
                arg: number;
              };
            } & {
              params: {};
            }
          >,
          res: TypedResponse<Partial<TypedResponseOptions>, []>,
          next: NextFunction
        ) => void)
      | undefined
    >();

    expectTypeOf<t5_1>().toEqualTypeOf<
      | ((
          req: TypedRequest<
            {
              body: number;
              params: {
                arg: number;
              };
            } & {
              params: {};
            }
          >,
          res: TypedResponse<TypedResponseOptions, []>,
          next: NextFunction
        ) => void)
      | undefined
    >();

    expectTypeOf<t6_1>().toEqualTypeOf<
      | ((
          req: TypedRequest<
            Partial<TypedRequestOptions> & {
              params: {};
            }
          >,
          res: TypedResponse<Partial<TypedResponseOptions>, []>,
          next: NextFunction
        ) => void)
      | undefined
    >();

    expectTypeOf<t6_2>().toEqualTypeOf<
      | ((
          req: TypedRequest<
            TypedRequestOptions & {
              params: {};
            }
          >,
          res: TypedResponse<Partial<TypedResponseOptions>, []>,
          next: NextFunction
        ) => void)
      | undefined
    >();

    expectTypeOf<t6_3>().toEqualTypeOf<
      | ((
          req: TypedRequest<
            TypedRequestOptions & {
              params: {};
            }
          >,
          res: TypedResponse<TypedResponseOptions, []>,
          next: NextFunction
        ) => void)
      | undefined
    >();

    expectTypeOf<t6_4>().toEqualTypeOf<
      | ((
          req: TypedRequest<
            {
              body: number;
            } & {
              params: {};
            }
          >,
          res: TypedResponse<TypedResponseOptions, []>,
          next: NextFunction
        ) => void)
      | undefined
    >();

    expectTypeOf<t6_5>().toEqualTypeOf<
      | ((
          req: TypedRequest<
            {
              body: number;
              params: {
                arg: number;
              };
            } & {
              params: {};
            }
          >,
          res: TypedResponse<TypedResponseOptions, []>,
          next: NextFunction
        ) => void)
      | undefined
    >();

    expectTypeOf<t6_6>().toEqualTypeOf<
      | ((
          req: TypedRequest<
            {
              body: number;
              params: {
                arg: number;
              };
            } & {
              params: {
                nestedId: string;
              };
            }
          >,
          res: TypedResponse<TypedResponseOptions, []>,
          next: NextFunction
        ) => void)
      | undefined
    >();
  });

  it("expected errors", () => {
    // @ts-expect-error
    const R1 = new TypedRouter({ "/home": { get: "not a function" } });

    // @ts-expect-error
    const R2 = new TypedRouter({ "/home": { wrongMethod: (req: any) => {} } });

    const R3_1 = new TypedRouter({
      "/home": {
        get: (req, res, next) => {
          const a = req.params;
        },
      },
    });
    const R3_2 = new TypedRouter({
      "/home/:productId": {
        get: (req) => {
          const a = req.params;
        },
      },
    });
    const R3_3 = new TypedRouter({
      "/home/:productId": {
        get: (req) => {
          const a = req.body;
        },
      },
    });
  });
});

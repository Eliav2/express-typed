import { describe, it, expectTypeOf } from "vitest";
import { StringOnly, TypedRequest, TypedRouter, TypedRouter, TypedRoutes } from "../src/express-typed";

describe("TypedRouter", () => {
  it("explicit TypedRequest", () => {
    const r = new TypedRouter({
      "/home": {
        get: (req: TypedRequest<{ body: { name: string } }>) => {
          const a = req.params;
        },
      },
    });

    expectTypeOf<typeof r>().toEqualTypeOf<
      TypedRouter<{
        "/home": {
          get: (
            req: TypedRequest<{
              body: {
                name: string;
              };
            }>
          ) => void;
        };
      }>
    >();
  });
  it("explicit TypedRequest with unmatched path param", () => {
    const r = new TypedRouter({
      "/:explicitly_typed_with_param": {
        // @ts-expect-error: `TypedRequest<{ body: { val: string } }>)` is not compatible with `TypedRequest<{ params: { explicitly_typed_with_param: string } }>`
        get: (req: TypedRequest<{ body: { val: string } }>) => {
          const a = req.params;
        },
      },
    });
  });
  it("expected errors", () => {
    type t1 = TypedRouter<{ "/home": { get: (req: any) => void } }>;

    // simple
    const RN1 = new TypedRouter({
      "/home": {
        get: (req) => {
          const a = req.params;
        },
      },
    });

    // nested
    const RNNested = new TypedRouter({
      "/nested": new TypedRouter({
        "/test": { get: (req) => {} },
      }),
    });

    // mixed
    const RN2 = new TypedRouter({
      "/home": {
        get: (req) => {
          const a = req.params;
        },
      },
      "/:id": {
        get: (req) => {
          req;
        },
        post: (req) => {},
      },
      "/nested2": new TypedRouter({ "/test": { get: (req) => {} } }),
      "/nested": new TypedRouter({
        "/route": {
          get: (req) => {
            return req;
          },
        },
        "/:param": {
          get: (req) => {
            return req.params?.param;
          },
        },
        "/moreNested": new TypedRouter({
          "/:param": {
            get: (req) => {
              // req.params.aa;
              return req.params?.param;
            },
            "/moreNested2": new TypedRouter({
              "/test": {
                get: (req) => {
                  return req;
                },
                "/moreNested3": new TypedRouter({
                  "/test": {
                    post: (req) => {
                      return req;
                    },
                  },
                }),
              },
            }),
          },
        }),
      }),
    });

    // typed TypedRequest
    const RN5 = new TypedRouter({
      "/home": {
        get: (req) => {
          const a = req.params;
        },
      },
    });

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

    const func = (req, res, next) => {
      const a = req.params;
    };

    const R3_2 = new TypedRouter({
      "/home/:productId": {
        get: (req) => {
          const a = req;
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

type Names = "eliav" | "yosi";

// example one - error correctly on extra property
{
  type MyGeneric<T> = { [Name in Names]?: T };
  const ok: MyGeneric<string> = { eliav: "" };
  //                                                  //correct error - Object literal may only specify known properties, and 'extra' does not exist in type '{ eliav: any; yosi: any; }'.ts(2353)
  const shouldError: MyGeneric<string> = { eliav: "", extra: "any" };
}
// example two - no error on extra prop, why?
{
  class SomeClass<T extends { [Name in Names]?: string }> {
    classProp: { [Name in Names]?: string };
    constructor(classProp: { [Name in Names]?: string }) {
      this.classProp = classProp;
    }
  }
  const ok = new SomeClass({ eliav: "", extra: "" });
}

// example three
{
  type TypedRoutes<Routes> = { [Route in keyof Routes]?: Routes[Route] };
  class Router<T> {
    routes: TypedRoutes<T>;
    constructor(routes: TypedRoutes<T>) {
      this.routes = routes;
    }
  }
  const ok = new Router({ eliav: "" });
}
{
  type TypedRoutes<Routes> = {
    [Route in keyof Routes]?: [Routes, Route, Routes[Route]];
  };

  class Router<T> {
    routes: TypedRoutes<T>;
    constructor(routes: TypedRoutes<T>) {
      this.routes = routes;
    }
  }

  const ok = new Router({ "/home": [""] });
}
// capital strings mapps
// a mapping of props to values that of type string with first letter capital
{
  type TypedNamesMap<Map extends Record<string, Capitalize<string>>> = {
    [Route in keyof Map]?: Capitalize<Map[Route]>;
  };

  class NamesMap<Map extends Record<string, Capitalize<string>>> {
    routes: Map;
    constructor(routes: Map) {
      this.routes = routes;
    }
  }
  // wanted error: type "eliav" is not assignable to type "Eliav" , but no actual error error
  // |
  // v
  const ok = new NamesMap({ firstName: "Eliav" });
  //^ typeof ok -> NamesMap<{readonly firstName: unknown;}>
  //  wanted typeof ok -> NamesMap<{readonly firstName: "Eliav"}>
}
// capital strings mapps
// a mapping of props to values that of type string with first letter capital
{
  type TypedMapWithNamesAsKeys<Map> = {
    [Route in Capitalize<StringOnly<keyof Map>>]?: any;
  };

  class MapWithNamesAsKeys<Map> {
    routes: TypedMapWithNamesAsKeys<Map>;
    constructor(routes: TypedMapWithNamesAsKeys<Map>) {
      this.routes = routes;
    }
  }
  // wanted error: type "eliav" is not assignable to type "eliav" , but no actual error error
  // |
  // v
  const ok = new MapWithNamesAsKeys({ FirstName: "eliav" });
  //^ typeof ok -> NamesMap<{readonly firstName: unknown;}>
  //  wanted typeof ok -> NamesMap<{readonly firstName: "Eliav"}>
}

// undestanding extending a generic type vs extending a parameter of a generic type (in the constructor)
{
  type CapitalizeMapValues<Map extends Record<string, string>> = {
    [K in keyof Map]: Capitalize<Map[K]>;
  };
  // extending a generic type
  {
    class Test<T extends CapitalizeMapValues<T>> {
      prop: T;
      constructor(prop: T) {
        this.prop = prop;
      }
    }
    // error as expected: Type '"eliav"' is not assignable to type '"Eliav"'.ts(2322)
    const test = new Test({ firstName: "eliav" });
  }
  // extending a parameter of a generic type (in the constructor)
  {
    class Test<const T extends Record<string, string>> {
      prop: CapitalizeMapValues<T>;
      constructor(prop: CapitalizeMapValues<T>) {
        this.prop = prop;
      }
    }
    // error as expected: Type 'string' is not assignable to type 'Capitalize<string>'.ts(2322)
    const test = new Test({ firstName: "eliav" });
  }
}

function compose<const A, const B, const C>(f: (arg: A) => B, g: (arg: B) => C): (arg: A) => C {
  return (x) => g(f(x));
}
interface Box<T> {
  value: T;
}
function makeArray<const T>(x: T): T[] {
  return [x];
}
function makeBox<const U>(value: U): Box<U> {
  return { value };
}
// has type '(arg: {}) => Box<{}[]>'
const makeBoxedArray = compose(makeArray, makeBox);
const v = makeBoxedArray("hello!");

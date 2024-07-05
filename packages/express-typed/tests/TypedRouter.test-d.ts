import { describe, it } from "vitest";
import { StringOnly, TypedRequest, TypedRouter, TypedRouterNew } from "../src/express-typed";

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

describe("TypedRouter", () => {
  it("expected errors", () => {
    type t1 = TypedRouterNew<{ "/home": { get: (req: any) => void } }>;

    // simple
    const RN1 = new TypedRouterNew({
      "/home": {
        get: (req) => {
          const a = req.params;
        },
      },
    });

    // nested
    const RNNested = new TypedRouterNew({
      "/nested": new TypedRouterNew({}),
    });

    // mixed
    const RN2 = new TypedRouterNew({
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
      "/nested2": new TypedRouterNew({ test: { get: (req) => {} } }),
      "/nested": new TypedRouterNew({
        "/route": {
          get: (req) => {
            return req;
          },
          post: (req) => {},
        },
        "/moreNested": new TypedRouterNew({
          "/:yu": {
            get: (req) => {
              req.params.aa;
              return req.params.yu;
            },
          },
        }),
      }),
    });

    // typed TypedRequest
    const RN5 = new TypedRouterNew({
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

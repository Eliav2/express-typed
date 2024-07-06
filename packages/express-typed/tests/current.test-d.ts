import { describe, it } from "vitest";
import { StrictTypedRequest, TypedRequest, TypedRequestOptions, TypedRouter } from "../src/express-typed";

describe("TypedRouter", () => {
  it("expected errors", () => {
    // typed TypedRequest
    const RN5 = new TypedRouter({
      "/nested1": new TypedRouter({
        "/test": {
          get: (req) => {
            const body = req;
          },
        },
        "/nested2": new TypedRouter({
          "/test": {
            get: (req) => {},
          },
          "/nested3": new TypedRouter({
            "/test": {
              get: (req) => {},
              post: (req) => {},
            },
          }),
        }),
      }),

      "/not-typed": {
        get: (req) => {
          const body = req.body;
          const a = req.params;
        },
      },

      "/:someParam": {
        get: (req) => {
          // @ts-expect-error
          const error = req.params?.error;
          const param = req.params?.someParam;
        },
      },
      "/router": {
        wrong: (req) => {},
      },

      "/explicitly-typed": {
        get: (req: TypedRequest<{ body: { val: string } }>) => {
          const a = req.params;
        },
      },
      "/:someParam2": {
        // @ts-expect-error: `TypedRequest<{ body: { val: string } }>)` is not compatible with `TypedRequest<{ params: { someParam2: string } }>`
        get: (req: TypedRequest<{ body: { val: string } }>) => {
          const a = req.params;
        },
        post: (req) => {
          const a = req.params;
        },
      },
    });
  });
});

// testing TypedRequest direct assertions
{
  type InferedType = TypedRequest<{
    body: { val: string };
    query?: unknown;
    params: {
      someParam2: string;
    };
  }>;
  type AssertedType = TypedRequest<{ body: { val: string } }>;
  type t1 = InferedType extends AssertedType ? true : false;

  //Type '{ body: { val: string; }; }' is not assignable to type 'InferedType'. Property 'params' is missing in type '{ body: { val: string; }; }' but required in type '{ params: { someParam2: string; }; }'.ts(2322)
  const c1: InferedType = { body: { val: "val" } };
  //    ^ error as expected

  const r = new TypedRouter({
    "/:someParam2": {
      // @ts-expect-error: `TypedRequest<{ body: { val: string } }>)` is not compatible with `TypedRequest<{ body?: unknown; query?: unknown; params: { someParam2: string; }; }> as expected`
      get: (req: TypedRequest<{ body: { val: string } }>) => {
        //  ^ no error, way?
        const a = req.params;
      },
      post: (req) => {
        //   ^ just for refernce, the inferred type is TypedRequest<{ body?: unknown; query?: unknown; params: { someParam2: string; }; }> as expected
        const a = req.params;
      },
    },
  });
}
// testing TypedRequest function assertions
{
  // Helper type to make all properties required
  type RequiredProperties<T> = { [K in keyof T]-?: T[K] };

  // Modify TypedRequest to be more strict
  type StrictTypedRequest<T extends Partial<TypedRequestOptions>> = RequiredProperties<T> & {
    [K in Exclude<keyof TypedRequestOptions, keyof T>]: never;
  };
  type InferedType = (
    req: StrictTypedRequest<{
      body: { val: string };
      query?: unknown;
      params: {
        someParam2: string;
      };
    }>
  ) => void;

  type AssertedType = (req: StrictTypedRequest<{ body: { val: string } }>) => void;

  type t1 = InferedType extends AssertedType ? true : false; // This should be false

  // This should now correctly raise a type error
  const c1: InferedType = (req: { body: { val: string } }) => {};
}

// exact type of function arguments
{
  {
    // values assertions
    const cv1: { name: string } = {};
    //    ^ error as expected: Property 'name' is missing in type '{}' but required in type '{ name: string; }'.ts(2741)
    const cv2: { name: never } = { name: "eliav" };
    //                             ^ error as expected: Type 'string' is not assignable to type 'never'.ts(2322)

    // vs function equivalent assertions
    // the assertion is on the opposite side because function and thier arguments are contravariant
    const cf1: (req: {}) => void = (req: { name: string }) => {};
    //    ^ error as expected: Property 'name' is missing in type '{}' but required in type '{ name: string; }'.ts(2741)
    const cf2: (req: { name: never }) => void = (req: { name: string }) => {};
    cf2({ name: "eliav" }); // note that type checking is done only when the function called
    //    ^ error as expected: Type 'string' is not assignable to type 'never'.ts(2322)
  }
  type InferedType = (req: TypedRequest<{ body: { val: string }; query?: unknown; params: { someParam2: string } }>) => void;

  type AssertedType = (req: TypedRequest<{ body: { val: string } }>) => void;

  type t1 = InferedType extends AssertedType ? true : false; // This should be false

  // This should now correctly raise a type error
  const c1: InferedType = (req: { body: { val: string } }) => {};
}

// testing TypedRequest assertions
{
  // This should be fine
  const c1: TypedRequest<{ body: { val: string } }> = { body: { val: "val" } };

  // This should raise an error because params is defined but not provided
  const c2: TypedRequest<{ body: { val: string }; params: { explicitly_typed_with_param: string } }> = {
    body: { val: "val" },
  }; // Error: Property 'params' is missing in type...
  // This should raise an error because params is defined but not provided
  const c2_1: TypedRequest<{ body: { val: string } & { params: { explicitly_typed_with_param: string } } }> = {
    body: { val: "val" },
  }; // Error: Property 'params' is missing in type...

  // This should be fine
  const c3: TypedRequest<{ body: { val: string }; params: { explicitly_typed_with_param: string } }> = {
    body: { val: "val" },
    params: { explicitly_typed_with_param: "test" },
  };

  // This should raise an error because params is provided but not defined in the type
  const c4: TypedRequest<{ body: { val: string } }> = {
    body: { val: "val" },
    params: { explicitly_typed_with_param: "test" }, // Error: Type ... is not assignable to type 'undefined'
  };

  // This should be fine (params is optional when not specified in the generic)
  const c5: TypedRequest = {
    body: { someData: "value" },
    params: { someParam: "value" },
  };
}
type t2 = TypedRequestOptions & { params: { val: string } };
type t2_1 = t2["params"];
type t3 = TypedRequestOptions extends TypedRequestOptions & { params: { val: string } } ? true : false;

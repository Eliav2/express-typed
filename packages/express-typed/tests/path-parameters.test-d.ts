import { expectTypeOf, test } from "vitest";
import {
  ExtractRouteParams,
  FlatNestedRouters,
  FlatTypedRouter,
  GetRouteResponseInfo,
  HandlerMethods,
  InterpolateRouteParamsIntoStrings,
  ParseRoutes,
  TypedRequest,
  TypedResponse,
  TypedRouter,
} from "../src/express-typed";
import { NextFunction } from "express";
import { OnlyString } from "../src/type-utils";

const typedRouter = new TypedRouter({
  // "/": {
  //   get: (req, res) => {
  //     return res.send(`these is 100 users in the db`).status(200);
  //   },
  // },
  "/posts/:title": {
    get: (req, res) => {
      return res.send(`Post: ${req.params.title}`).status(200);
    },
  },
  "/user": new TypedRouter({
    "/:id": {
      get: (req, res) => {
        return res.send(`User: ${req.params.id}`).status(200);
      },
    },
  }),
});
// type ParseRoutes<T extends TypedRouter<any>> = FlatNestedRouters<T["routes"]>;
type AppRoutes = ParseRoutes<typeof typedRouter>;
type PostsRoute = GetRouteResponseInfo<AppRoutes, "/posts/:title", "get">;

test("RebuildRouterWithParams", () => {
  // recives flat router and apply type-safe path params
  type RebuildRouterWithPathParams<Router extends FlatTypedRouter> = {
    [Path in OnlyString<keyof Router> as InterpolateRouteParamsIntoStrings<Path>]: {
      [H in keyof Router[Path]]: (
        req: TypedRequest<{ params: { [key in ExtractRouteParams<Path>]: string } }>,
        res: TypedResponse,
        next: NextFunction
      ) => void;
    };
  };
  type t1 = RebuildRouterWithPathParams<AppRoutes>;
  type t2 = t1["/posts/123"];

  expectTypeOf<t1>().toEqualTypeOf<{
    // "/": {
    //   get: (
    //     req: TypedRequest<{
    //       params: {};
    //     }>,
    //     res: TypedResponse,
    //     next: NextFunction
    //   ) => void;
    // };

    [x: `/posts/${string}`]: {
      get: (
        req: TypedRequest<{
          params: {
            title: string;
          };
        }>,
        res: TypedResponse,
        next: NextFunction
      ) => void;
    };
    [x: `/user/${string}`]: {
      get: (
        req: TypedRequest<{
          params: {
            id: string;
          };
        }>,
        res: TypedResponse,
        next: NextFunction
      ) => void;
    };
  }>();
});

test("ExtractRouteParams", () => {
  type t = ExtractRouteParams<"/123/:title">;
  expectTypeOf<ExtractRouteParams<"/">>().toEqualTypeOf<never>();
  expectTypeOf<ExtractRouteParams<"/path">>().toEqualTypeOf<never>();
  expectTypeOf<ExtractRouteParams<"/path/">>().toEqualTypeOf<never>();
  expectTypeOf<ExtractRouteParams<"/123/:title">>().toEqualTypeOf<"title">();
  expectTypeOf<ExtractRouteParams<"/123/:title/:id">>().toEqualTypeOf<"title" | "id">();
  expectTypeOf<ExtractRouteParams<"/123/:title/:id/123">>().toEqualTypeOf<"title" | "id">();
});

test("MakeRouteParamsStrings", () => {
  type t1 = InterpolateRouteParamsIntoStrings<"/123/:title">;
  expectTypeOf<InterpolateRouteParamsIntoStrings<"">>().toEqualTypeOf<``>();
  expectTypeOf<InterpolateRouteParamsIntoStrings<"/">>().toEqualTypeOf<`/`>();
  expectTypeOf<InterpolateRouteParamsIntoStrings<"/123">>().toEqualTypeOf<`/123`>();
  expectTypeOf<InterpolateRouteParamsIntoStrings<"/123/:title">>().toEqualTypeOf<`/123/${string}`>();
  expectTypeOf<InterpolateRouteParamsIntoStrings<"/123/:title/">>().toEqualTypeOf<`/123/${string}/`>();
  expectTypeOf<InterpolateRouteParamsIntoStrings<"/123/:title/:id">>().toEqualTypeOf<`/123/${string}/${string}`>();
  expectTypeOf<InterpolateRouteParamsIntoStrings<"/123/:title/:id/ccc">>().toEqualTypeOf<`/123/${string}/${string}/ccc`>();
});

type GetRouteParamFromString<
  Template extends string,
  Actual extends string,
  Param extends string
> = Template extends `${infer Start}/:${infer CurrentParam}/${infer Rest}`
  ? CurrentParam extends Param
    ? Actual extends `${Start}/${infer Value}/${infer ActualRest}`
      ? GetRouteParamFromString<`${Rest}`, `${ActualRest}`, Param>
      : never
    : GetRouteParamFromString<`${Start}/:${Rest}`, Actual, Param>
  : Template extends `${infer Start}/:${Param}`
  ? Actual extends `${Start}/${infer Value}?`
    ? Value
    : never
  : never;

type t1 = GetRouteParamFromString<"/path/:title/:id", "/path/my-title/cqw123czx", "title">;
// Evaluates to "my-title"

// expectTypeOf<GetRouteParamFromString<"/path/:title", "/path/my-title", "title">>().toEqualTypeOf<"my-title">();
// // Passes

// expectTypeOf<GetRouteParamFromString<"/path/:title/:id", "/path/my-title/cqw123czx", "title">>().toEqualTypeOf<"my-title">();
// Passes

// type specialDict = { [x: `/${string}`]: string };
// type t2 = z["/123"];

// type ExtractAfterSlash<S extends string> = S extends `/${infer Rest}` ? Rest : never;

// type StringValuePairs<T extends string> = {
//   [K in T as `/${ExtractAfterSlash<K>}`]: string;
// };

// type z = StringValuePairs<`/${string}`>;
// type t2 = z[keyof z]; // string

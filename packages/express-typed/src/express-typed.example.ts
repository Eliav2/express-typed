import { FlatNestedRouters, GetRouteResponseInfo, GetRouteResponseInfoHelper, HandlerMethods, KeysWithMethod, ParseRoutes, TypedRouter } from "./express-typed";

const typedRouter = new TypedRouter({
  "/": {
    get: (req, res) => {
      const test = res.send("Typesafe Route!").status(200);
      return test;
    },
  },
  "/test": {
    get: (req, res) => {
      return res.json({ message: 123 }).status(200).send("test");
    },
    post: (req, res) => {
      return res.send("post res!").status(200);
    },
  },
  "/post-only": {
    post: (req, res) => {
      return res.send("post only res!").status(200);
    },
  },
  "/nested": new TypedRouter({
    "/": {
      get: (req, res) => {
        const test = res.send("get /nested/").status(200);
        return test;
      },
      post: (req, res) => {
        const test = res.json("json response, post, /nested/").status(200).send("text response, post, /nested/");
        return test;
      },
    },
    "/all": {
      all: (req, res) => {
        return res.send("responding to all methods");
      },
    },
  }),
});

type TypedRoutes = ParseRoutes<typeof typedRouter>;

type RoutesWithMethod<
  Method extends HandlerMethods
  // Info extends keyof TypedRoutes[keyof TypedRoutes]
  // Info extends keyof GetRouteResponseInfoHelper<TypedRoutes, keyof TypedRoutes, Method> | "body" = "body"
> = {
  [key in KeysWithMethod<TypedRoutes, Method>]: Method extends keyof TypedRoutes[key]
    ? GetRouteResponseInfo<TypedRoutes, key, Method>
    : // ? Info extends "body"
      //   ? GetRouteResponseInfo<TypedRoutes, key, Method, Info>
      //   : GetRouteResponseInfo<TypedRoutes, key, Method>
      never;
};

// // usage

type GetRoutesInfo<
  Path extends keyof TypedRoutes,
  Method extends keyof TypedRoutes[Path],
  Info extends keyof GetRouteResponseInfoHelper<TypedRoutes, Path, Method> | "body" = "body"
> = GetRouteResponseInfo<TypedRoutes, Path, Method, Info>;

type HomeResponse = GetRoutesInfo<"/nested/", "post", "json">;

// usage
// get all routes that have a "get" method, and their response types
type GetRoutes = RoutesWithMethod<"get">;
//   ^?
// get all routes that have a "post" method, and their response types
type PostRoutes = RoutesWithMethod<"post">;
//   ^?
////

type OnlyString<T> = T extends string ? T : never;
type FlatKeyof<T> = OnlyString<keyof T>;

type NestedRouter = TypedRouter<{
  "/": { get: any };
  "/xxx": { get: any };
  // "/router": TypedRouter<{ "/": { post: (req,res)=>{}, } }>;
  "/router": TypedRouter<{ "/111": any; "/555": any; "/doubleNested": TypedRouter<{ "/kk": { all: any } }> }>;
  "/xxxqq": TypedRouter<{ "/": any; "/555": any; "/doubleNested": TypedRouter<{ "/kk": { all: any } }> }>;
}>;

type st5 = FlatNestedRouters<NestedRouter["routes"]>;
type st5_122 = st5["/xxx"];

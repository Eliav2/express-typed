# express-typed

[![npm version](https://badge.fury.io/js/express-typed.svg)](https://www.npmjs.com/package/express-typed)
[![npm downloads](https://img.shields.io/npm/dm/express-typed.svg)](https://www.npmjs.com/package/express-typed)

express-typed is an end-to-end typesafe TypeScript wrapper for Express.js, designed to streamline the development
process by providing strong typing support throughout your Express application.

express-typed **infers types from your backend codebase**, unlike libraries such as [ts-rest](https://ts-rest.com/)
and [zodios](https://www.zodios.org/), which often require separate type definitions. This approach offers a developer
experience akin to [trpc](https://trpc.io/), just in Expressjs, without the need to switch to an entirely different
framework.

This type of inference becomes especially useful when working with dynamic backend types such those handled when using
prisma!

![express-typed-gif](https://github.com/Eliav2/express-typed/assets/47307889/9c8d9406-73b8-4932-8312-282c9e56988d)

This library is still in its early stages, and API changes are expected. A stable version will be released once the API
is finalized, after feedback from the community.

By the way, this library is just a tiny wrapper written in a single file, so you can simply copy over
the [express-typed.ts](https://github.com/Eliav2/express-typed/blob/main/packages/express-typed/src/express-typed.ts)
file into your project instead of installing it, and modify it as you see fit.

## Installation

Install express-typed on your backend.

You can install express-typed by:

```bash
pnpm add express-typed

# or

yarn add express-typed

# or (why?)

npm install express-typed
```

## Hello World Example

express-typed is focused on your express routers because that's where you define your API routes, and that's what's
important for end-to-end type safety.

use `TypedRouter` from `express-typed` instead of `express.Router`, the rest of the code remains the same:

```typescript
import express from "express";
import { TypedRouter, ParseRoutes } from "express-typed";

const app = express();

//// THIS:
const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  res.send("Hello World!").status(200);
});
router.post("/", async (req, res) => {
  res.send(req.body).status(200);
});

app.use(router);
//// -->
//// BECOMES THIS:
const typedRouter = new TypedRouter({
  get: {
    "/": async (req, res) => {
      res.send("Hello World!").status(200);
    },
  },
  post: {
    "/": async (req, res) => {
      res.send(req.body).status(200);
    },
  },
});

app.use(typedRouter.router);

// this type can be imported and used by your frontend code
export type AppRoutes = ParseRoutes<typeof typedRouter>;
/////

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
```

## Demo

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/Eliav2/express-typed/tree/main?startScript=start-demo&file=examples/fullstack_react_express-typed/express-typed-demo/src/routes/index.routes.ts&file=examples/fullstack_react_express-typed/frontend-demo/src/App.tsx)

This demo opens a full-stack react+express project in StackBlitz, demonstrating end-to-end type safety with
express-typed on the left pane and a simple react app on the right pane. play with the types on the backend and watch
them reflect on the frontend immediately.

this demo if from [this](/examples/fullstack_react_express-typed) example.

see prisma example [here](/examples/express-typed-prisma/src/routes/typed.routes.ts)

## Usage

**NOTICE: the next types should be defined on your side, using the helper types from `express-typed`.**

unfortunately, typescript does not support higher-order generic type aliases, so some of the next types are going to be
quite verbose, but they are still very useful, and defined using the helper types from `express-typed`.

this approach was designed in such a way that you would never need to install `express-typed` on your frontend, only on
your backend, and then import the types you need to your frontend codebase.

<details>

<summary>

### AppRoutes

</summary>

Once your TypedRouter is defined, You start by extracting the relevant types from your TypedRouter instance by using
the `ParseRoutes` type.

```ts
export type AppRoutes = ParseRoutes<typeof typedRouter>;
```

`ParseRoutes` is a helper type that extracts all routes information from the TypedRouter and flattens nested
TypedRouters.

`AppRoutes` would be now used with all the helper types from `express-typed` to extract the information you need from
the routes. never pass `typeof typedRouter` directly to the helper types, always use `AppRoutes`.

if this lib does not provide the type you need, you can always extract it from `AppRoutes` entirely yourself, or by
utilizing helper types from `express-typed`.

</details>

<details>

<summary>

### RouteResResolver

</summary>

`RouteResResolver` is used to extract the response type from a specific route.

```ts
import { GetRouteResponseInfo, GetRouteResponseInfoHelper } from "express-typed";
//// RouteResResolver
export type RouteResResolver<
  Path extends keyof AppRoutes,
  Method extends keyof AppRoutes[Path],
  Info extends keyof GetRouteResponseInfoHelper<AppRoutes, Path, Method> | "body" = "body"
> = GetRouteResponseInfo<AppRoutes, Path, Method, Info>;
```

usage:

```ts
// get the response from the home page
// the info passed to res.send, res.json, or res.jsonp
type HomePageResponse = RouteResResolver<"/", "get">;
//   ^? "Hello World!"
```

by default, `RouteResResolver` would return the information passed to the `res.send`, to the `res.json` or to
the `res.jsonp` functions in the route handler, but you can also extract other information like the status code,
headers, etc.

```ts
// get specific info from the response (here, the status code)
type HomePageStatus = RouteResResolver<"/", "get", "status">;
//   ^? 200
```

then you can use these types on your frontend codebase to ensure type safety. for example using `axios`
and `react-query`(from [here](/examples/fullstack_react_express-typed/frontend-demo/src/queries.ts)):

```ts
// queries.ts
import { useQuery } from "@tanstack/react-query";
import axios, { type AxiosStatic } from "axios";
import type { AppRoutes, RouteResResolver } from "your-backend-package/src/routes/index.routes";

// an hook to fetch response from server, for any possible method(GET, POST, PUT, DELETE)
export const useAppQuery = <Path extends keyof AppRoutes, Method extends Extract<keyof AxiosStatic, keyof AppRoutes[Path]>>(
  path: Path,
  method: Method
) => {
  return useQuery<RouteResResolver<Path, Method>>({
    queryKey: [path],
    queryFn: async () => {
      const res = await (axios as any)[method](`/api${path}`);
      return res.data as RouteResResolver<Path, Method>;
    },
  });
};
```

and usage(see [here](/examples/fullstack_react_express-typed/frontend-demo/src/App.tsx)):

```tsx
import { useAppQuery } from "./queries";

function App() {
  const query = useAppQuery("/", "get");
  const data = query.data;
  //    ^? const query: UseQueryResult<"Hello world", Error>

  console.log("data", data);

  return <>{JSON.stringify(data)}</>;
}

export default App;
```

</details>

<details>

<summary>

### RouteReqResolver

</summary>

`RouteReqResolver` is defined on your side with the help of `GetRouteRequestHelper` and `GetRouteRequest`:

```ts
import { GetRouteRequestHelper, GetRouteRequest, TypedRouter } from "express-typed";

export type RouteReqResolver<
  Path extends keyof AppRoutes,
  Method extends keyof AppRoutes[Path],
  Info extends keyof GetRouteRequestHelper<AppRoutes, Path, Method> = Extract<keyof GetRouteRequestHelper<AppRoutes, Path, Method>, "body">
> = GetRouteRequest<AppRoutes, Path, Method, Info>;

const typedRouter = new TypedRouter({
  "/": {
    get: (req: TypedRequest<{ body: "bb"; query: "qq" }>, res) => {
      const body = req.body;
      const test = res.send("Home").status(200);
      return test;
    },
  },
});

type HomePageBody = RouteReqResolver<"/", "get">;
//   ^? "bb"
type HomePageQuery = RouteReqResolver<"/", "get", "query">;
//   ^? "qq"
```

example of using this info with react-query mutation(
see [here](/examples/fullstack_react_express-typed/frontend-demo/src/mutations.ts)):

```ts
import { DefaultError, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { AppRoutes, RouteReqResolver, RouteResResolver } from "express-typed-demo/src/routes/index.routes";

const useAppMutation = <Path extends keyof AppRoutes, Method extends keyof AppRoutes[Path]>(path: Path, method: Method) => {
  const mutation = useMutation<RouteResResolver<Path, Method>, DefaultError, RouteReqResolver<Path, Method>>({
    mutationKey: ["mutation", path, method],
    mutationFn: async () => {
      const res = await (axios as any)[method](`/api${path}`);
      return res.data as RouteResResolver<Path, Method>;
    },
  });
  return mutation;
};

// completly type safe
const testMutation = useAppMutation("/mutate", "post");
testMutation.mutate({ name: "test" });
```

</details>

<details>

<summary>

### RoutesWithMethod

</summary>

`RoutesWithMethod` is used to extract all the routes with a specific method from the routes object.

```ts
import { GetRoutesWithMethod, GetRouterMethods } from "express-typed";
//// RoutesWithMethod
export type RoutesWithMethod<Method extends GetRouterMethods<AppRoutes>> = GetRoutesWithMethod<AppRoutes, Method>;
```

usage(see [here](/examples/fullstack_react_express-typed/frontend-demo/src/queries.ts)):

```ts
// get all routes that have a "get" method, and their response types
type GetRoutes = RoutesWithMethod<"get">;
//   ^? type GetRoutes = { "/": "Hello world"};

// get all routes that have a "post" method, and their response types
type PostRoutes = RoutesWithMethod<"post">;
//   ^?  type GetRoutes = { "/": typeof req.body};
```

then in your frontend codebase, you can define the following react-query hooks:

```ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { RoutesWithMethod } from "express-typed-demo/src/routes/index.routes";

// an hook to fetch response from server, for GET method
type GetRoutes = RoutesWithMethod<"get">;
export const useAppGetQuery = <P extends keyof GetRoutes>(path: P) => {
  return useQuery<GetRoutes[P]>({
    queryKey: [path],
    queryFn: async () => {
      const res = await axios.get(`/api${path}`);
      return res.data as GetRoutes[P];
    },
  });
};

// an hook to fetch response from server, for POST method
type PostRoutes = RoutesWithMethod<"post">;
export const useAppPostQuery = <P extends keyof PostRoutes>(path: P) => {
  return useQuery<PostRoutes[P]>({
    queryKey: [path],
    queryFn: async () => {
      const res = await axios.post(`/api${path}`);
      return res.data as PostRoutes[P];
    },
  });
};
```

</details>

<details>

<summary>

### Complete Example

</summary>

see full example [here](/examples/fullstack_react_express-typed/express-typed-demo/src/routes/index.routes.ts)

```typescript
import {
  GetRouteRequest,
  GetRouteRequestHelper,
  GetRouteResponseInfo,
  GetRouteResponseInfoHelper,
  GetRouterMethods,
  GetRoutesWithMethod,
  ParseRoutes,
  TypedRequest,
  TypedRouter,
} from "express-typed";

const typedRouter = new TypedRouter({
  // your routes here
});

export default typedRouter;

// these should be defined in any express app, and later be used in your frontend codebase
//      |
//      v

export type AppRoutes = ParseRoutes<typeof typedRouter>;

export type RouteResResolver<
  // example usage
  Path extends keyof AppRoutes,
  Method extends keyof AppRoutes[Path],
  Info extends keyof GetRouteResponseInfoHelper<AppRoutes, Path, Method> | "body" = "body"
> = GetRouteResponseInfo<AppRoutes, Path, Method, Info>;

export type RouteReqResolver<
  Path extends keyof AppRoutes,
  Method extends keyof AppRoutes[Path],
  Info extends keyof GetRouteRequestHelper<AppRoutes, Path, Method> = Extract<keyof GetRouteRequestHelper<AppRoutes, Path, Method>, "body">
> = GetRouteRequest<AppRoutes, Path, Method, Info>;

export type RoutesWithMethod<Method extends GetRouterMethods<AppRoutes>> = GetRoutesWithMethod<AppRoutes, Method>;
```

</details>

## Quick walkthrough

This demo highlights the key usage and features of express-typed, including type inference, explicit typing, and nested routes. follow the comments line by line to understand the usage better.

```ts
import { TypedRequest, TypedResponse, TypedRouter, ParseRoutes } from "express-typed";

const typedRouter = new TypedRouter({
  // returned type is inferred
  "/": {
    get: (req, res) => {
      return res.send("get: /").status(200);
    },
    post: (req, res) => {
      return res.send("post: /").status(200);
    },
  },
  // request body is explicitly typed, response is inferred based on the return value
  "/explicit-req": {
    get: (req: TypedRequest<{ body: { name: string } }>, res) => {
      const body = req.body;
      //    ^?
      return res.json(req.body).status(200);
    },
  },
  // response body is explicitly typed, retrun type must at least extend { name: string }
  "/explicit-res": {
    get: (req, res: TypedResponse<{ body: { name: string } }>) => {
      return res.json({ name: "eliav" }).status(200);
    },
  },
  // nested router are allowed, and fully typed
  "/nested": new TypedRouter({
    "/": {
      get: (req, res) => {
        const test = res.send("get /nested/").status(200);
        return test;
      },
      // async methods are supported
      post: async (req, res) => {
        const test = (await (await fetch("https://jsonplaceholder.typicode.com/todos/1")).json()) as {
          userId: number;
          id: number;
          title: string;
          completed: boolean;
        };
        return res.json(test).status(200);
      },
    },
    // any of "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head" is allowed as a method
    "/all": {
      all: (req, res) => {
        return res.send("responding to all methods");
      },
    },
  }),
});

export default typedRouter;

export type AppRoutes = ParseRoutes<typeof typedRouter>;
```

and pretty much, that's it! you can now use the types defined in `AppRoutes` to ensure type safety in your frontend codebase.

## Contributing

This library is still in its early stages, and that's exactly the time to suggest significant changes.

Contributions are welcome! If you find any issues or have suggestions for improvements, feel free to open an issue or
submit a pull request on GitHub.

The technique that was used in this lib could be used to create similar typesafe adapters for other backend frameworks
like Fastify, Koa, etc.

**Pull requests to the dev branch only, please.**

## roadmap

- [x] basic router support
- [x] nested routers support
- [x] backend return type inference(the type that the backend returns)
- [x] backend request type inference(the type that the backend expects in the request)
- [x] explicitly typed request/response
- [ ] type-safe path parameters
- [ ] type-safe query parameters

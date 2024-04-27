# express-typed

_Not stable yet_

[![npm version](https://badge.fury.io/js/express-typed.svg)](https://www.npmjs.com/package/express-typed)
[![npm downloads](https://img.shields.io/npm/dm/express-typed.svg)](https://www.npmjs.com/package/express-typed)

express-typed is an end-to-end TypeScript wrapper for Express.js, designed to streamline the development process by providing strong typing support throughout your Express application.

express-typed **infers types from your backend codebase**, unlike libraries such as [ts-rest](https://ts-rest.com/) and [zodios](https://www.zodios.org/), which often require separate type definitions. This approach offers a developer experience akin to [trpc](https://trpc.io/), just in expressjs, without the need to switch to an entirely different framework.

## Installation

You can install express-typed via npm:

```bash
pnpm add express-typed

# or

yarn add express-typed

# or (why?)

npm install express-typed
```

## Usage

express-typed is focused on your express routers, because that's where you define your API routes.

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



## Contributing

This library is still in its early stages, and that's exactly the time to suggest significant changes.

Contributions are welcome! If you find any issues or have suggestions for improvements, feel free to open an issue or submit a pull request on GitHub.

The technique that was used in this lib creates similar typesafe adapters for other backend frameworks like Fastify, Koa, etc.

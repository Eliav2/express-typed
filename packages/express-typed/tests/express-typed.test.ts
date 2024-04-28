import {
  TypedRouter
} from "../src/express-typed";

import { expect, test } from "vitest";

// Test TypedRouter
test("TypedRouter", () => {
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
  });

  expect(typedRouter).toBeDefined();
});


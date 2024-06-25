import { expect, test, describe, expectTypeOf } from "vitest";
import { TypedRequest, TypedResponse, TypedRouter } from "../src/express-typed";
import request from "supertest";
import express from "express";

// Test TypedRouter
describe.skip("TypedRouter path params types", () => {
  const typedRouter = new TypedRouter({
    // returned type is inferred
    "/path-param/:id": {
      get: (req, res) => {
        expectTypeOf<typeof req.params>().toEqualTypeOf<{ id: string }>();
        return res.send(`get: /path-param/${req.params.id}`).status(200);
      },
    },
  });

  test("types for TypedRouter serves correctly express path params", async () => {
    const app = express();
    app.use(typedRouter.router);
    await request(app)
      .get("/path-param/1")
      .expect(200)
      .then((res) => {
        expectTypeOf(res.text).toEqualTypeOf<`get: /path-param/${string}`>();
      });
  });
});

import { expect, test, describe } from "vitest";
import { TypedRequest, TypedResponse, TypedRouter } from "../src/express-typed";
import request from "supertest";
import express from "express";

// Test TypedRouter
describe.skip("TypedRouter path params", () => {
  const typedRouter = new TypedRouter({
    // returned type is inferred
    "/path-param/:id": {
      get: (req, res) => {
        return res.send(`get: /path-param/${req.params.id}`).status(200);
      },
    },
  });
  test("TypedRouter correctly defined", () => {
    expect(typedRouter).toBeDefined();
  });

  test("TypedRouter serves correctly express path params", async () => {
    const app = express();
    app.use(typedRouter.router);
    await request(app)
      .get("/path-param/1")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("get: /path-param/1");
      });
  });
});

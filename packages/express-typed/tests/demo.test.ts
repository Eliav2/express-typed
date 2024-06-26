import { expect, test, describe } from "vitest";
import { TypedRequest, TypedResponse, TypedRouter } from "../src/express-typed";
import request from "supertest";
import express from "express";

// Test TypedRouter
describe("TypedRouter", () => {
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
  test("TypedRouter correctly defined", () => {
    expect(typedRouter).toBeDefined();
  });
  test("TypedRouter serves correctly express routes", async () => {
    const app = express();
    app.use(typedRouter.router);
    await request(app)
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("get: /");
      });

    await request(app)
      .post("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("post: /");
      });
  });

  test("TypedRouter serves correctly express nested routes", async () => {
    const app = express();
    app.use(typedRouter.router);
    await request(app)
      .get("/nested")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("get /nested/");
      });

    await request(app)
      .post("/nested")
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          userId: 1,
          id: 1,
          title: "delectus aut autem",
          completed: false,
        });
      });

    await request(app)
      .options("/nested/all")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("responding to all methods");
      });
  });
});

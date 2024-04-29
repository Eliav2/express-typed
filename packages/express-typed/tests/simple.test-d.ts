import { TypedRouter } from "../src/express-typed";

const typedRouter = new TypedRouter({
  "/": {
    get: (req, res) => {
      return res.send("get: /").status(200);
    },
  },
});

import { TypedRouter } from "express-typed";

const typedRouter = new TypedRouter({
  "/": {
    get: (req, res) => {
      return res.send("even-more-nested").status(200);
    },
  },
});

export default typedRouter;

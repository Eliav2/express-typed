import { TypedRouter } from "express-typed";
import NestedRouter from "./route.nested";
const typedRouter = new TypedRouter({
  "/": {
    get: (req, res) => {
      return res.send("nested").status(200);
    },
  },
});

export default typedRouter;

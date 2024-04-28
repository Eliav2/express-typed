import express, { Request, Response } from "express";
import routeNested from "./nested.js";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  res.send("Hello World!").status(200);
});
router.post("/", async (req, res) => {
  // Do something with the request body data
  res.send(req.body).status(200);
});

router.use("/nested", routeNested);

export default router;

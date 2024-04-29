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

// router.get("/posts/:title", async (req, res) => {
//   res.send(`Post: ${req.params.title}`).status(200);
// });
router.get("/posts/:title/123", async (req, res) => {
  res.send(`123 Post: ${req.params.title}`).status(200);
});

router.get("/posts/:title/555", async (req, res) => {
  res.send(`555 Post: ${req.params.title}`).status(200);
});

export default router;

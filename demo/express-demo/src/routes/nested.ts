import express, { Request, Response } from "express";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  res.send("nested").status(200);
});

router.get("/hey", async (req: Request, res: Response) => {
  res.send("nested-more").status(200);
});
export default router;

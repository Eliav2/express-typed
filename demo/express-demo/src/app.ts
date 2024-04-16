import express, { Request, Response } from "express";
import logger from "morgan";

// Create Express server
export const app = express();

app.use(logger("dev"));

// Parse incoming requests data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  res.send("Hello World!").status(200);
});

app.use("/", router);

const server = app.listen(3000, () => {
  console.log(`Listening on port ${3000}`);
});

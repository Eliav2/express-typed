import express from "express";
import logger from "morgan";
import typedRouter from "./routes/typed.routes.js";
import notTypedRouter from "./routes/not-typed.routes.js";

// Create Express server
export const app = express();

app.use(logger("dev"));

// Parse incoming requests data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/typed", typedRouter.router);

app.use("/not-typed", notTypedRouter);

const server = app.listen(4000, () => {
  console.log(`Listening on port ${4000}`);
});

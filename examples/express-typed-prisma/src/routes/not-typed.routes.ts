import { PrismaClient } from "@prisma/client";
import express, { Request } from "express";

const prisma = new PrismaClient();

const router = express.Router();

router.post("/", async (req:Request<any,any,{user:string}>, res) => {
  const userWhoesPosts = req.body.user;
  const user = await prisma.user.findUnique({
    where: {
      email: userWhoesPosts,
    },
    include: {
      posts: true,
    },
  });
  const posts = user?.posts;
  // const users = await prisma.user.findMany();
  return res.json(posts).status(200);
});

export default router;

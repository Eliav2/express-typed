import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // create a user with 3 posts
  const user = await prisma.user.upsert({
    where: { email: "user@mail.com" },
    update: {},
    create: {
      email: "user@mail.com",
      name: "User",
      posts: {
        create: [
          { title: "Post 1", content: "Content 1" },
          { title: "Post 2", content: "Content 2" },
          { title: "Post 3", content: "Content 3" },
        ],
      },
      password: "password",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

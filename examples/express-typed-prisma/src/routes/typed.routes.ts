import { PrismaClient } from "@prisma/client";
import {
  GetRouteRequest,
  GetRouteRequestHelper,
  GetRouteResponseInfo,
  GetRouteResponseInfoHelper,
  GetRouterMethods,
  GetRoutesWithMethod,
  ParseRoutes,
  TypedRouter,
} from "express-typed";

const prisma = new PrismaClient();

const typedRouter = new TypedRouter({
  // example usage
  "/": {
    get: (req, res) => {
      return res.send("Hello world").status(200);
    },
  },
  "/prisma": new TypedRouter({
    "/user": {
      get: async (req, res) => {
        const users = await prisma.user.findMany();
        return res.json(users).status(200);
      },
    },
    "/post": {
      get: async (req, res) => {
        const posts = await prisma.post.findMany({
          where: {},
        });

        return res.send("post response").status(200);
      },
    },
  }),
});

export default typedRouter;

export type AppRoutes = ParseRoutes<typeof typedRouter>;

export type RouteResResolver<
  Path extends keyof AppRoutes,
  Method extends keyof AppRoutes[Path],
  Info extends keyof GetRouteResponseInfoHelper<AppRoutes, Path, Method> | "body" = "body",
> = GetRouteResponseInfo<AppRoutes, Path, Method, Info>;

export type RoutesWithMethod<Method extends GetRouterMethods<AppRoutes>> = GetRoutesWithMethod<AppRoutes, Method>;

type HomeRouteResponse = RouteResResolver<"/", "get">;
type UserRouteResponse = RouteResResolver<"/prisma/user", "get">;

export type RouteReqResolver<
  Path extends keyof AppRoutes,
  Method extends keyof AppRoutes[Path],
  Info extends keyof GetRouteRequestHelper<AppRoutes, Path, Method> = Extract<keyof GetRouteRequestHelper<AppRoutes, Path, Method>, "body">
> = GetRouteRequest<AppRoutes, Path, Method, Info>;

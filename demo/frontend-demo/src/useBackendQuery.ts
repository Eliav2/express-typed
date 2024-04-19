import { useQuery } from "@tanstack/react-query";
import type { TypedRoutes, RoutesWithMethod } from "express-typed-demo/src/router";
// import type { GetRoutes } from "express-typed";

type GetRoutes = RoutesWithMethod<"get">;

export const useBackendQuery = <P extends keyof GetRoutes>(path: P) => {
  return useQuery<GetRoutes[P]>({
    queryKey: [path],
    queryFn: async () => {
      const res = await fetch(`/api${path}`);
      const text = await res.text();
      return text;
    },
  });
};

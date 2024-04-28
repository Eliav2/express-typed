import { useQuery } from "@tanstack/react-query";
import axios, { type AxiosStatic } from "axios";
import type { AppRoutes, RouteResResolver, RoutesWithMethod } from "express-typed-demo/src/routes/index.routes";

// an hook to fetch response from server, for any possible method(GET, POST, PUT, DELETE)
export const useAppQuery = <Path extends keyof AppRoutes, Method extends Extract<keyof AxiosStatic, keyof AppRoutes[Path]>>(
  path: Path,
  method: Method
) => {
  return useQuery<RouteResResolver<Path, Method>>({
    queryKey: [path, method],
    queryFn: async () => {
      const res = await (axios as any)[method](`/api${path}`);
      return res.data as RouteResResolver<Path, Method>;
    },
  });
};

// an hook to fetch response from server, for GET method
type GetRoutes = RoutesWithMethod<"get">;
export const useAppGetQuery = <P extends keyof GetRoutes>(path: P) => {
  return useQuery<GetRoutes[P]>({
    queryKey: [path, "get"],
    queryFn: async () => {
      const res = await axios.get(`/api${path}`);
      return res.data as GetRoutes[P];
    },
  });
};

// an hook to fetch response from server, for POST method
type PostRoutes = RoutesWithMethod<"post">;
export const useAppPostQuery = <P extends keyof PostRoutes>(path: P) => {
  return useQuery<PostRoutes[P]>({
    queryKey: [path, "post"],
    queryFn: async () => {
      const res = await axios.post(`/api${path}`);
      return res.data as PostRoutes[P];
    },
  });
};

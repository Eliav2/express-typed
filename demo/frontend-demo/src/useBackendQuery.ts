import { useQuery } from "@tanstack/react-query";
import type { TypedRoutes } from "../../express-typed-demo/src/router";
import type { GetRoutes } from "express-typed";

const useBackendQuery = (path: keyof TypedRoutes) => {
  return useQuery({
    queryKey: [path],
    queryFn: async () => {
      const res = await fetch(`http://localhost:4000${path}`);
      return res.json();
    },
  });
};

const useHelloQuery = () => {
  return useBackendQuery("/test");
};

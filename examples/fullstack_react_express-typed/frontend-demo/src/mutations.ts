import { DefaultError, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { AppRoutes, RouteReqResolver, RouteResResolver } from "express-typed-demo/src/routes/index.routes";

const useAppMutation = <Path extends keyof AppRoutes, Method extends keyof AppRoutes[Path]>(path: Path, method: Method) => {
  const mutation = useMutation<RouteResResolver<Path, Method>, DefaultError, RouteReqResolver<Path, Method>>({
    mutationKey: ["mutation", path, method],
    mutationFn: async () => {
      const res = await (axios as any)[method](`/api${path}`);
      return res.data as RouteResResolver<Path, Method>;
    },
  });
  return mutation;
};

// completly type safe
const testMutation = useAppMutation("/mutate", "post");
testMutation.mutate({ name: "test" });

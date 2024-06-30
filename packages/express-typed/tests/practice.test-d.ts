import { describe, expectTypeOf, it } from "vitest";

type StringOnly<T> = T extends string ? T : never;

describe("practice typescript type aliases", () => {
  it("FlatRoutes", () => {
    class Router<Routes> {
      routes: Routes;
      constructor(routes: Routes) {
        this.routes = routes;
      }
    }

    type FlatRouter<Routes> = {
      [Route in keyof Routes]: (
        x: Routes[Route] extends Router<infer NestedRoutes>
          ? // flat any nested routes recursively
            FlatRouter<{
              // re-map nested routes strins to be prefixed with parent route
              [NestedRoute in keyof NestedRoutes as `${StringOnly<Route>}${StringOnly<NestedRoute>}`]: NestedRoutes[NestedRoute];
            }>
          : Pick<Routes, Route>
      ) => void;
      // trick to re-map keys into union of intersections using function arguments (see https://stackoverflow.com/questions/78364892/typescript-how-to-flatten-nested-generic-type-into-parent-generic-type)
    } extends { [k: string]: (x: infer I) => void }
      ? { [K in keyof I]: I[K] }
      : never;

    type Routes = Router<{ "/home": "home"; "/auth": Router<{ "/github": "github"; "/google": "google" }> }>;
    type FlatRoutes = FlatRouter<Routes["routes"]>;
    expectTypeOf<FlatRoutes>().toEqualTypeOf<{
      "/home": "home";
      "/auth/github": "github";
      "/auth/google": "google";
    }>();

    type Routes2 = Router<{
      "/home": "home";
      "/auth": Router<{ "/github": "github"; "/google": "google"; "/moreNested": Router<{ "/deep": "deep!" }> }>;
    }>;
    type FlatRoutes2 = FlatRouter<Routes2["routes"]>;

    expectTypeOf<FlatRoutes2>().toEqualTypeOf<{
      "/home": "home";
      "/auth/github": "github";
      "/auth/google": "google";
      "/auth/moreNested/deep": "deep!";
    }>();

    type Routes3 = Router<{
      "/home": (req: any, res: any) => void;
      "/auth": Router<{ "/github": (req: any, res: any) => void; "/google": (req: any, res: any) => void }>;
    }>;
    type FlatRoutes3 = FlatRouter<Routes3["routes"]>;
    expectTypeOf<FlatRoutes3>().toEqualTypeOf<{
      "/home": (req: any, res: any) => void;
      "/auth/github": (req: any, res: any) => void;
      "/auth/google": (req: any, res: any) => void;
    }>();
  });
});

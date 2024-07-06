const r = new TypedRouter({
  "/:someParam2": {
    // @ts-expect-error: `TypedRequest<{ body: { val: string } }>)` is not compatible with `TypedRequest<{ body?: unknown; query?: unknown; params: { someParam2: string; }; }> as expected`
    get: (req: TypedRequest<{ body: { val: string } }>) => {
      //  ^ no error, way?
      const a = req.params;
    },
  },
});

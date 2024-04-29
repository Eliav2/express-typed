export type WithDefault<T, D> = T extends D ? T : D;

export type DefaultIfUnknown<T, D> = unknown extends T ? D : T;

// https://stackoverflow.com/a/50375286/12371242
export type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

export type FilterUnknown<T> = {
  [K in keyof T as unknown extends T[K] ? never : K]: T[K];
};

export type OnlyString<T> = T extends string ? T : never;
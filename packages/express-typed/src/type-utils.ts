export type WithDefault<T, D> = T extends D ? T : D;

// https://stackoverflow.com/a/50375286/12371242
export type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

// // https://stackoverflow.com/a/61960616/10577976
// export type Exact<A, B> = A extends B ? (B extends A ? A : never) : never;

// ClaudeAI
export type Exact<T, Shape> = T & {
  [K in keyof T]: K extends keyof Shape ? T[K] : never;
};

// // https://stackoverflow.com/a/57117594/10577976
// // First, define a type that, when passed a union of keys, creates an object which
// // cannot have those properties. I couldn't find a way to use this type directly,
// // but it can be used with the below type.
// type Impossible<K extends keyof any> = {
//   [P in K]: never;
// };

// // The secret sauce! Provide it the type that contains only the properties you want,
// // and then a type that extends that type, based on what the caller provided
// // using generics.
// export type NoExtraProperties<T, U extends T = T> = U & Impossible<Exclude<keyof U, keyof T>>;

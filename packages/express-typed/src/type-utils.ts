export type WithDefault<T, D> = T extends D ? T : D;

// https://stackoverflow.com/a/50375286/12371242
export type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

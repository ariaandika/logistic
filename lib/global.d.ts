// / <reference path="./schema/schema.d.ts"/>

export {}

declare global {
  type Result<T> =
    { success: true; data: T } |
    { success: true; data: null, message: string } |
    { success: false; error: Error };
   
  interface Array<T> {
    filter(predicate: BooleanConstructor, thisArg?: any): NonFalsy<T>[];
  }

  interface ReadonlyArray<T> {
    filter(predicate: BooleanConstructor, thisArg?: any): NonFalsy<T>[];
  }
}

type NonFalsy<T> = T extends false | 0 | "" | null | undefined | 0n
  ? never
  : T;

/// <reference path="./types/db.d.ts" />
/// <reference path="./types/view.d.ts" />
/// <reference path="./types/handle.d.ts" />
/// <reference path="./types/table.d.ts" />
import * as _z from "zod";
import { envSchema } from "api-server/internal/config"
import { Pool } from "mysql2/promise";

declare global {
  const z: typeof _z.z ;
  const pool: Pool
  const app: import("express").Express;
  
  const Ok: <T>(data: T) => Result<T>
  const None: <T = any>(msg?: string) => Result<T>
  const Err: <T = any>(msg?: string, name?: string) => Result<T>
  const ServerErr: <T = any>(error: any) => Result<T>

  function safeParseInt(val: any | undefined, fallback?: number): Result<number> | number;  
  
  
  type Result<T> =
    { success: true; data: T } |
    { success: null; message: string } |
    { success: false; error: Error };
   
  interface Array<T> {
    filter(predicate: BooleanConstructor, thisArg?: any): NonFalsy<T>[];
  }

  interface ReadonlyArray<T> {
    filter(predicate: BooleanConstructor, thisArg?: any): NonFalsy<T>[];
  }
  
  type NonFalsy<T> = T extends false | 0 | "" | null | undefined | 0n
    ? never
    : T;
    
  namespace NodeJS {
    interface ProcessEnv extends Zod.infer<typeof envSchema> { }
  }
}
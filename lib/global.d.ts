/// <reference path="./schema/schema.d.ts"/>

import { z } from "zod";


declare global {
  type Result<T> =
    { success: true; data: T } |
    { success: false; error: Error };

  type zany = z.AnyZodObject
  type zf<T> = z.infer<T>
  type zt = z.ZodType
  
  type Conn = import('mysql2/promise').PoolConnection
  type Pool = import('mysql2/promise').Pool
  type ExpressApp = import('express').Application
}

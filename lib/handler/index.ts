import { z } from 'zod'
import x from "express";
import { Err, ServerErr } from '../util';

const handles: {
  schema: Parameters<typeof builder>[0],
  route: Parameters<typeof builder>[1],
  handle: Parameters<typeof builder>[2],
}[] = []


// create handle builder
export const builder = <T extends { Input: Zod.AnyZodObject, Output: Zod.AnyZodObject }>(schema: T, route: string, handle: (
  exec: <U>(sql: string, val?: any) => Promise<U[]>,
  i: z.infer<T['Input']>,
) => Promise<Result<Zod.infer<T['Output']>>>) => {
  handles.push({ schema, route, handle })
}

// create express handler
export const createExpress = (pool: import('mysql2/promise').Pool) => {
  const app = x.Router()
  
  for (const { route, handle, schema } of handles) {
    app.post(route, async (req,res)=> {
      const body = await schema.Input.safeParseAsync(req.body)
      
      if (!body.success) return res.json(Err())
      
      const conn = await pool.getConnection()
      
      try {
        const result = await handle( (sql,val) => { return conn.execute(sql,val) as Promise<any> }, body.data )
        res.json(result)
      } catch (error) {
        ServerErr(error)
      } finally {
        conn.release()
      }
    })
  }
  
  return app
}
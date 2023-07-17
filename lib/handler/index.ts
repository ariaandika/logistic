import x from "express";
import { Err, ServerErr } from '../util';

// express handler entry point

import { handles } from "./handler";

export const createExpress = (pool: import('mysql2/promise').Pool) => {
  const app = x.Router()
  
  for (const { handle, schema } of handles) {
    app.post(schema.url, async (req,res)=> {
      const body = await schema.Input.safeParseAsync(req.body)
      
      if (!body.success) return res.json(Err('Invalid data'))
      
      const conn = await pool.getConnection()
      
      try {
        const result = await handle( async (sql,val) => { return (await conn.execute(sql,val))[0] as any }, body.data )
        res.json(result)
      } catch (error) {
        res.json(ServerErr(error))
      } finally {
        conn.release()
      }
    })
  }
  
  return app
}
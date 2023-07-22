import x from "express";
import { Err, ServerErr } from '../util';
import type { Pool } from "mysql2/promise"

// express handler entry point

import { handles } from "./handler";

// check endpoint conflict
import * as apiSchemas from "./schema";
{
  Object.values(apiSchemas).reduce((acc,now)=>{
    if (acc.find(e=>e.url == now.url)){
      throw new Error('DUPLICATE URL, ' + now.url)
    }
    return [...acc, now]
  }, [] as { url: string }[])
}

export const createExpress = (pool: Pool) => {
  const app = x.Router()
  
  for (const { handle, schema } of handles) {
    app.post(schema.url, async (req,res)=> {
      const body = await schema.Input.safeParseAsync(req.body)
      
      if (!body.success) return res.json(Err('coba lagi',`${console.log(req.url)}`))
      
      const conn = await pool.getConnection()
      await conn.beginTransaction()
      
      try {
        const result = await handle( async (sql,val) => { return (await conn.execute(sql,val))[0] as any }, body.data )
        await conn.commit()
        res.json(result)
      } catch (error) {
        await conn.rollback()
        res.json(ServerErr(error))
      } finally {
        conn.release()
      }
    })
  }
  
  return app
}

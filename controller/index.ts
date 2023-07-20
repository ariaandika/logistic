import express from "express";
import { json } from "body-parser";
import { createExpress } from "lib/handler";
import "./internal/config";
import { pool } from "./internal/db";
import { cors, logger } from "./internal/middleware";

const app = express()
const PORT = 4040
const router = createExpress(pool)

app.use(json())

if (process.env.ENVIRONMENT == 'development') {
  app.use(cors)
}

app.use(logger);
app.use(router);

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT_ERR]',err)
})


const server = app.listen(PORT,()=>console.log(`Listening in http://localhost:${PORT}...`))
console.log("pid",process.pid)

process.on('SIGINT',e=>{
  console.log('closing server...')
  server.close()
})
server.once('close',()=>{
  pool.end()
  process.removeAllListeners()
})

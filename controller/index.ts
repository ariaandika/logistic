import express from "express";
import { json } from "body-parser";
import { createExpress } from "lib/handler";
import "./internal/config";
import { pool } from "./internal/db";
import { cors, logger } from "./internal/middleware";

const app = express()

const router = createExpress(pool)

app.use(json())
app.use(router)
app.use(cors)
app.use(logger);

const PORT = parseInt( process.env.CONTROLLERPORT ?? "4040")

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT_ERR]',err)
})


const server = app.listen(PORT,()=>console.log(`Listening in http://localhost:${PORT}...`))
console.log("pid",process.pid)

process.on('SIGINT',e=>{
  console.log('closing server...')
  server.close()
})
process.on('SIGTERM',e=>{
  console.log(':P')
})
server.once('close',()=>{
  process.removeAllListeners()
})

console.log('man')

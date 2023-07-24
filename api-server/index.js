// @ts-check
import express from "express";
import mid from "body-parser";
import "./internal/config.js";
import "./internal/db.js"
import { cors, logger } from "./internal/middleware.js";

// @ts-ignore
global.app = express()

const PORT = process.env.CONTROLLERPORT ?? 4040

app.use(mid.json())

if (process.env.ENVIRONMENT == 'development') {
  app.use(cors)
  app.get('/',(req,res)=>{ res.send('<script>fetch("/manifest",{method:"post",body:JSON.stringify({manifest_id:1}),headers:{"content-type":"application/json"}}).then(e=>e.text()).then(console.log)</script>') })
}

app.use(logger);

await import("lib-dyn/api/express.js")

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT_ERR]',err)
})


const server = app.listen(PORT,()=>console.log(`Listening in http://localhost:${PORT}...`))
console.log("pid",process.pid)

process.on('SIGINT',e=>{
  console.log('closing server...')
  pool.end()
  server.closeIdleConnections()
  server.closeAllConnections()
  server.close(async ()=>{
    console.log('aA')
    process.exit()
  })
})

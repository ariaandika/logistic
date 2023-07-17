import express from "express";
import { json } from "body-parser";
import { createExpress } from "lib/handler";
import "./internal/config";
import { pool } from "./internal/db";

const app = express()

const router = createExpress(pool)

app.use(json())
app.use(router)

app.get('/',(req,res)=>{
  res.send(`<script>
    fetch('/user/login', {
      method: "post",
      body: JSON.stringify({ username: "mason", passwd: "mason123" }),
      headers: { 'content-type': 'application/json' }
    }).then(e=>e.text()).then(e=>console.log(e))
  </script>`);
})

app.get('/reg',(req,res)=>{
  res.send(`<script>
    fetch('/user/register', {
      method: "post",
      body: JSON.stringify({ username: "mason", passwd: "mason123", type: "counter" }),
      headers: { 'content-type': 'application/json' }
    }).then(e=>e.text()).then(console.log)
  </script>`);
})

const PORT = parseInt( process.env.CONTROLLERPORT ?? "4040")

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT_ERR]',err)
})

async function main() {
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
}

main()
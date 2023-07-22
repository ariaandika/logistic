import { Handler } from "express";

export const logger: Handler = (req,_,next)=>{
  const date = new Date()
  const m = date.getMinutes(), s = date.getSeconds()
  const time = "[" + (m < 10 ? '0' : '') + m + ":" + (s < 10 ? '0' : '') + s + "]"
  console.log(time, req.method.toUpperCase(), req.path)
  next()
}

export const verbose_logger: Handler = (req,_,next)=>{
  const a = req.body
  console.log("[BODY]", a)
  next()
}

export const cors: Handler = (_,res,next)=>{
  res.setHeader('access-control-allow-origin','*')
  .setHeader('access-control-allow-method','*')
  .setHeader('access-control-allow-headers','*')
  .setHeader('Access-Control-Allow-Content-Type','application/json')
  next()
}

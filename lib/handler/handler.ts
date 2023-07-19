import bcrypt from "bcrypt";
import { None, Ok } from "lib/util";
import { UserSchema } from "../schema/database"
import { z } from 'zod'
import { Login, Logout, Register, Session } from "./schema";

export const handles: {
  schema: Parameters<typeof builder>[0],
  handle: Parameters<typeof builder>[1],
}[] = []

const builder = <T extends { Input: Zod.AnyZodObject, Output: Zod.AnyZodObject, url: string }>(schema: T, handle: (
  exec: <U = { insertId: number }>(sql: string, val?: any) => Promise<U extends { insertId: number } ? { insertId: number } : U[]>,
  i: z.infer<T['Input']>,
) => Promise<Result<Zod.infer<T['Output']>>>) => {
  handles.push({ schema, handle })
}

const ui = new Uint8Array(20)
const d = new TextDecoder()

const createHash = () => {
  const b = ui.map(_=>Math.floor(Math.random() * 95) + 33);
  return d.decode(b)
}

const saltRounds = 10


builder(Register, async (exec, { username, passwd, type }) => {
  const [user] = await exec<Zod.infer<typeof UserSchema>>("SELECT `username` FROM user WHERE `username` = ? LIMIT 1", [username])
  
  if (user) return None('Username tidak tersedia')
  
  const hash = await bcrypt.hash(passwd, saltRounds)
  const somes = await exec<{ insertId: number }>("insert into user (`username`, `passwd`, `type`) values (?, ?, ?)", [username,hash,type])
  console.log(somes)
  return Ok({ id: somes.insertId })
})

builder(Login, async (exec, { username, passwd }) => {
  
  const [user] = await exec<Zod.infer<typeof UserSchema>>("SELECT * FROM user WHERE username = ? LIMIT 1", [username])
  
  const err = 'username atau password salah'
  
  if (!user) return None(err)
  
  const result = await bcrypt.compare(passwd, user.passwd)
  
  if (!result) return None(err)
  
  const hash = createHash()
  
  await exec('insert into session (`sessionId`,`value`,`user_id`) values (?, ?, ?)',[hash,'key=value',user.id])
  console.log('LOGIN UUID', hash)
  return Ok({ type: user.type, sessionId: hash })
})

builder(Session, async (exec, { cookie }) => {
  
  const [sessionValue] = await exec<Zod.infer<typeof Session['Output']>>(`\
  SELECT s.value,s.exp,u.username,u.type FROM session s
  LEFT JOIN user u ON u.id = s.user_id
  WHERE sessionId = ?
  `, [cookie])
  
  return sessionValue ? Ok(sessionValue) : None('silahkan login kembali')
})

builder(Logout, async (exec, { sessionId }) => {
  await exec('delete from session where sessionId = ? limit 1',[sessionId])
  return Ok({})
})
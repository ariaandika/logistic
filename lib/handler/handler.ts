import bcrypt from "bcrypt";
import { Err, Ok } from "lib/util";
import { UserSchema } from "../schema/database"
import { z } from 'zod'
import { Login, Register, Session } from "./schema";

export const handles: {
  schema: Parameters<typeof builder>[0],
  handle: Parameters<typeof builder>[1],
}[] = []

const builder = <T extends { Input: Zod.AnyZodObject, Output: Zod.AnyZodObject, url: string }>(schema: T, handle: (
  exec: <U = { inserId: number }>(sql: string, val?: any) => Promise<U[]>,
  i: z.infer<T['Input']>,
) => Promise<Result<Zod.infer<T['Output']>>>) => {
  handles.push({ schema, handle })
}

const saltRounds = 10


builder(Register, async (exec, { username, passwd, type }) => {
  const [user] = await exec<Zod.infer<typeof UserSchema>>("SELECT `username` FROM user WHERE `username` = ? LIMIT 1", [username])
  
  if (user) return Err('Username tidak tersedia')
  
  const hash = await bcrypt.hash(passwd, saltRounds)
  const somes = await exec<{ insertId: number }>("insert into user (`username`, `passwd`, `type`) values (?, ?, ?)", [username,hash,type])
  console.log(somes)
  return Ok({ id: 2 })
})

builder(Login, async (exec, { username, passwd }) => {
  
  const [user] = await exec<Zod.infer<typeof UserSchema>>("SELECT * FROM user WHERE username = ? LIMIT 1", [username])
  
  const err = 'username atau password salah'
  
  if (!user) return Err(err)
  
  const result = await bcrypt.compare(passwd, user.passwd)
  
  return result ? Ok({ type: user.type }) : Err(err)
})

builder(Session, async (exec, { cookie }) => {
  
  const [sessionValue] = await exec<Zod.infer<typeof Session['Output']>>(`\
  SELECT s.value,s.exp,u.username,u.type FROM session s
  WHERE sessionId = ? LEFT
  LEFT JOIN User u ON u.id = s.user_id`
  , [cookie])
  
  return Ok(sessionValue ?? null)
})
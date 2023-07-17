import bcrypt from "bcrypt";
import { Err, Ok } from "lib/util";
import { UserSchema } from "../schema/database"
import { z } from 'zod'

export const handles: {
  schema: Parameters<typeof builder>[0],
  route: Parameters<typeof builder>[1],
  handle: Parameters<typeof builder>[2],
}[] = []

export const builder = <T extends { Input: Zod.AnyZodObject, Output: Zod.AnyZodObject }>(schema: T, route: string, handle: (
  exec: <U = { inserId: number }>(sql: string, val?: any) => Promise<U[]>,
  i: z.infer<T['Input']>,
) => Promise<Result<Zod.infer<T['Output']>>>) => {
  handles.push({ schema, route, handle })
}

const saltRounds = 10

export const Login = {
  Input: UserSchema.pick({ username: true, passwd: true }),
  Output: UserSchema.pick({ type: true })
}

export const Register = {
  Input: UserSchema.omit({ id: true }),
  Output: UserSchema.pick({ id: true })
}

builder(Register, "/user/register", async (exec, { username, passwd, type }) => {
  const [user] = await exec<Zod.infer<typeof UserSchema>>("SELECT `username` FROM user WHERE `username` = ? LIMIT 1", [username])
  
  if (user) return Err('Username tidak tersedia')
  
  const hash = await bcrypt.hash(passwd, saltRounds)
  const somes = await exec<{ insertId: number }>("insert into user (`username`, `passwd`, `type`) values (?, ?, ?)", [username,hash,type])
  console.log(somes)
  return Ok({ id: 2 })
})

builder(Login, "/user/login", async (exec, { username, passwd }) => {
  
  const [user] = await exec<Zod.infer<typeof UserSchema>>("SELECT * FROM user WHERE username = ? LIMIT 1", [username])
  
  const err = 'username atau password salah'
  
  if (!user) return Err(err)
  
  const result = await bcrypt.compare(passwd, user.passwd)
  
  return result ? Ok({ type: user.type }) : Err(err)
})

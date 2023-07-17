import bcrypt from "bcrypt";
import { Err, Ok } from "lib/util";
import { builder } from ".";
import { UserSchema } from "../schema/database"

const saltRounds = 10

export const Login = {
  Input: UserSchema.pick({ username: true, password: true }),
  Output: UserSchema.pick({ type: true })
}

export const Register = {
  Input: UserSchema.omit({ id: true }),
  Output: UserSchema.pick({ id: true })
}

builder(Register, "/user/register", async (exec, { username, password, type }) => {
  
  const hash = await bcrypt.hash(password, saltRounds)
  const [{ insertId }] = await exec<{ insertId: number }>("insert into user (`username`, `password`, `type`) set (?, ?, ?)", [username,hash,type])
  
  return Ok({ id: insertId })
})

builder(Login, "/user/login", async (exec, { username, password }) => {
  const [user] = await exec<Zod.infer<typeof UserSchema>>("SELECT * FROM user WHERE username = ? LIMIT 1", [username])
  
  const err = ['username atau password salah']
  
  if (!user) return Err(...err)
  
  const result = await bcrypt.compare(password, user.password)
  
  return result ? Ok({ type: user.type }) : Err(...err)
})

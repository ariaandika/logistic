import { UserSchema, SessionSchema } from "../schema/database"
import { z } from "zod";

// Schema splitted so it can be used in client

export const Login = {
  Input: UserSchema.pick({ username: true, passwd: true }),
  Output: UserSchema.pick({ type: true }),
  url: "/user/login"
}

export const Register = {
  Input: UserSchema.omit({ id: true }),
  Output: UserSchema.pick({ id: true }),
  url: "/user/register"
}

export const Session = {
  Input: z.object({ cookie: z.string() }),
  Output: SessionSchema.pick({ value: true, exp: true }).extend(UserSchema.pick({ username: true, type: true }).shape),
  url: "/user/session"
}
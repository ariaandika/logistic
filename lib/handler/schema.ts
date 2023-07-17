import { UserSchema } from "../schema/database"

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
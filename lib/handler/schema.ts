import { UserSchema, SessionSchema, CounterSchema, BarangSchema, Barang_DetailSchema } from "../schema/database"
import { z } from "zod";
import { BarangDisplay } from "../schema/view";

// Schema splitted so it can be used in client

//#region Session management

export const Session = {
  Input: z.object({ cookie: z.string() }),
  Output: SessionSchema.pick({ value: true, exp: true }).extend(UserSchema.pick({ username: true, type: true, subjek: true }).shape),
  url: "/user/session"
}

export const Logout = {
  Input: z.object({ sessionId: z.string() }),
  Output: z.object({}),
  url: '/user/logout'
}

export const Login = {
  Input: UserSchema.pick({ username: true, passwd: true }),
  Output: UserSchema.pick({ type: true }).extend(SessionSchema.pick({ sessionId: true }).shape),
  url: "/user/login"
}

export const CounterRegister = {
  Input: UserSchema.omit({ id: true, subjek: true }).extend(CounterSchema.omit({ dibuat:true, id:true }).shape),
  Output: UserSchema.pick({ id: true }),
  url: "/user/counter/register"
}

//#endregion

export const BarangCounterList = {
  Input: z.object({ limit: z.number().optional(), subjek: z.number() }),
  Output: BarangDisplay.array(),
  url: '/barang/query'
}

export const BarangInsert = {
  Input: z.object({
    alamat: BarangSchema.omit({ no_resi: true }),
    barang_details: Barang_DetailSchema.omit({ barang_id: true }).array(),
    counter_id: z.number()
  }),
  Output: z.object({
    no_resi: z.number()
  }),
  url: '/barang/insert'
}
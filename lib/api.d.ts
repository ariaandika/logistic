import { Session,Logout,Login,CounterRegister,BarangCounterList,BarangInsert,TracingList,GatewayOut,DriverGet,GatewayIn,ManifestQuery,ManifestById,FinishBarang } from "./handler/schema.ts"

declare global {
  namespace Api {
    export type Session = Zod.infer<typeof Session["Output"]>
		export type Logout = Zod.infer<typeof Logout["Output"]>
		export type Login = Zod.infer<typeof Login["Output"]>
		export type CounterRegister = Zod.infer<typeof CounterRegister["Output"]>
		export type BarangCounterList = Zod.infer<typeof BarangCounterList["Output"]>
		export type BarangInsert = Zod.infer<typeof BarangInsert["Output"]>
		export type TracingList = Zod.infer<typeof TracingList["Output"]>
		export type GatewayOut = Zod.infer<typeof GatewayOut["Output"]>
		export type DriverGet = Zod.infer<typeof DriverGet["Output"]>
		export type GatewayIn = Zod.infer<typeof GatewayIn["Output"]>
		export type ManifestQuery = Zod.infer<typeof ManifestQuery["Output"]>
		export type ManifestById = Zod.infer<typeof ManifestById["Output"]>
		export type FinishBarang = Zod.infer<typeof FinishBarang["Output"]>
  }
}
import { BarangSchema,Barang_DetailSchema,TracingSchema,Barang_ManifestSchema,ManifestSchema,KurirSchema,PosSchema,CounterSchema,DriverSchema,UserSchema,SessionSchema } from "./schema/database.ts"

declare global {
  namespace DB {
    export type BarangSchema = Zod.infer<typeof BarangSchema>
		export type Barang_DetailSchema = Zod.infer<typeof Barang_DetailSchema>
		export type TracingSchema = Zod.infer<typeof TracingSchema>
		export type Barang_ManifestSchema = Zod.infer<typeof Barang_ManifestSchema>
		export type ManifestSchema = Zod.infer<typeof ManifestSchema>
		export type KurirSchema = Zod.infer<typeof KurirSchema>
		export type PosSchema = Zod.infer<typeof PosSchema>
		export type CounterSchema = Zod.infer<typeof CounterSchema>
		export type DriverSchema = Zod.infer<typeof DriverSchema>
		export type UserSchema = Zod.infer<typeof UserSchema>
		export type SessionSchema = Zod.infer<typeof SessionSchema>
  }
}
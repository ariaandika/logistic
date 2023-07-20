import { z } from "zod";
import { BarangSchema, Barang_DetailSchema, TracingSchema } from "./database";


export const BarangInsert = BarangSchema.omit({ no_resi: true })
export const Barang_DetailInsert = Barang_DetailSchema
export const TracingInsert = TracingSchema.omit({ 
  dibuat: true, 
  id: true,
})

export const BarangDisplay = BarangSchema.pick({ 
  no_resi: true, 
  kota: true, 
  total_koli: true, 
})

export const TracingDisplay = TracingSchema.pick({ 
  tipe: true, 
  subjek: true 
}).extend(z.object({
  nama: z.string(),
}).shape)
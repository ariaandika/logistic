import bcrypt from "bcrypt";
import { None, Ok } from "lib/util";
import { Barang_DetailSchema, BarangSchema, CounterSchema, TracingSchema, UserSchema } from "../schema/database"
import { BarangCounterList, Login, Logout, CounterRegister, Session, BarangInsert, TracingList } from "./schema";
import { q, schema, select } from "../util/sql";
import { BarangDisplay, TracingInsert } from "../schema/view";
import { table } from "../schema/tables";

export const handles: {
  schema: Parameters<typeof builder>['0'],
  handle: Parameters<typeof builder>['1'],
}[] = []

const builder = <T extends { Input: Zod.ZodType, Output: Zod.ZodType, url: string }>(schema: T, handle: (
  exec: <U = { insertId: number }>(sql: string, val?: any) => Promise<U extends { insertId: number } ? { insertId: number } : U[]>,
  i: Zod.infer<T['Input']>,
) => Promise<Result<Zod.infer<T['Output']>>>) => {
  handles.push({ schema, handle })
}

const ui = new Uint8Array(20)
const d = new TextDecoder()
const saltRounds = 10
const createHash = () => d.decode(ui.map(_=>Math.floor(Math.random() * 95) + 33))

//#region Session management

builder(Session, async (exec, { cookie }) => {
  
  const [sessionValue] = await exec<Zod.infer<typeof Session['Output']>>(`\
  SELECT s.value,s.exp,u.username,u.type,u.subjek FROM session s
  LEFT JOIN user u ON u.id = s.user_id
  WHERE sessionId = ?
  `, [cookie])
  
  return sessionValue ? Ok(sessionValue) : None('silahkan login kembali')
})

builder(Logout, async (exec, { sessionId }) => {
  await exec('delete from session where sessionId = ? limit 1',[sessionId])
  return Ok({})
})

builder(Login, async (exec, { username, passwd }) => {
  
  const err = 'username atau password salah'
  
  const [user] = await exec<Zod.infer<typeof UserSchema>>("SELECT * FROM user WHERE username = ? LIMIT 1", [username])
  if (!user) return None(err)
  
  const result = await bcrypt.compare(passwd, user.passwd)
  if (!result) return None(err)
  
  const hash = createHash()
  
  await exec('insert into session (`sessionId`,`value`,`user_id`) values (?, ?, ?)',[hash,'key=value',user.id])
  
  return Ok({ type: user.type, sessionId: hash })
})

builder(CounterRegister, async (exec, { username, passwd, type, nama }) => {
  const [user] = await exec<Zod.infer<typeof UserSchema>>("SELECT `username` FROM user WHERE `username` = ? LIMIT 1", [username])
  
  if (user) return None('Username tidak tersedia')
  
  const id = await exec('insert into counter (`nama`) values (?)',[nama])
  
  const hash = await bcrypt.hash(passwd, saltRounds)
  const somes = await exec<{ insertId: number }>(
    "insert into user (`username`, `passwd`, `type`, `subjek`) values (?,?,?,?)", 
    [username,hash,type,id.insertId]
  )
  
  return Ok({ id: somes.insertId })
})

//#endregion

//#region Counter Barang

builder(BarangCounterList, async (exec, { limit, subjek }) => {
  
  // get barang tracing 
  
  const result = await exec<Zod.infer<typeof BarangSchema>>(`\
  select ${schema(BarangDisplay,'b')} FROM tracing t
  LEFT JOIN barang b ON b.no_resi = t.barang_id
  WHERE t.aktif = true AND t.tipe = 'counter' AND t.subjek = ?
  LIMIT ?
  `, [subjek,limit ?? 50])

  return Ok(result)
})

builder(BarangInsert, async (exec, { alamat, barang_details, counter_id }) => {
  
  const vals = Object.values(alamat)
  
  const { insertId } = await exec(table.barang.insert(), vals)
  const promises = []
  
  const ivals = barang_details
    .map( detail => Object.values(Barang_DetailSchema.parse({ ...detail, barang_id: insertId })) )
    .flat()
  
  promises.push(exec( table.barang_detail.insert(barang_details.length) ,ivals))
  
  // BUG MYSQL DRIVER
  // promises.push(exec( table.tracing.insert(), [tracing_data] ))
  promises.push(exec( 
    `insert into tracing (barang_id, subjek, tipe, aktif) 
    values (${insertId}, ${counter_id}, 'counter', 1)
  `))
  
  await Promise.all(promises)
  return Ok({ no_resi: insertId })
})

builder(TracingList,async (exec, { barang_id }) => {
  
  // query all tracing by id
  
  const [barang] = await exec<object>(
    table.barang.select() + ' limit 1'
  )
  
  const result = await exec<Zod.infer<typeof TracingSchema>>(`\
    SELECT t.tipe,t.subjek,t.aktif,
      COALESCE(c.nama, k.nama, d.nama) AS nama
    FROM tracing t
    LEFT JOIN pos c ON t.tipe = 'counter' AND t.subjek = c.id
    LEFT JOIN kurir k ON t.tipe = 'kurir' AND t.subjek = k.id
    LEFT JOIN driver d ON t.tipe = 'driver' AND t.subjek = d.id
    WHERE t.barang_id = ?`,
    [barang_id]
  )
  
  if (result.length == 0) 
    return None(`Barang dengan no resi ${barang_id} tidak ditemukan`)
  
  const [last_tracing] = result.splice(result.findIndex(e=>e.aktif),1);
  
  const out = TracingList.Output.parse({
    barang,
    last_tracing,
    tracings: result
  })
  
  return Ok(out)
})

//#endregion Counter Barang
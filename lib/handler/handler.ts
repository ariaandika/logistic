import bcrypt from "bcrypt";
import { None, Ok } from "lib/util";
import { Barang_DetailSchema, BarangSchema, CounterSchema, ManifestSchema, TracingSchema, UserSchema } from "../schema/database"
import { BarangCounterList, Login, Logout, CounterRegister, Session, BarangInsert, TracingList, GatewayOut, DriverGet, GatewayIn, ManifestQuery, ManifestById, FinishBarang } from "./schema";
import { q, schema, select } from "../util/sql";
import { BarangDisplay, Barang_ManifestInsert, ManifestDisplay, ManifestDisplayExt, TracingInsert } from "../schema/view";
import { table } from "../schema/tables";

//#region Handler

export const handles: {
  schema: Parameters<typeof builder>['0'],
  handle: Parameters<typeof builder>['1'],
}[] = []

const builder = <T extends { Input: Zod.ZodType, Output: Zod.ZodType, url: string }>(schema: T, handle: (
  exec: <U = {[x: string]: any}>(sql: string, val?: any) => Promise<U extends null ? { insertId: number } : U[]>,
  i: Zod.infer<T['Input']>,
) => Promise<Result<Zod.infer<T['Output']>>>) => {
  handles.push({ schema, handle })
}

const dataParser = <T extends Zod.AnyZodObject>(s: T, data: Zod.infer<T>) => {
  return Object.values(s.parse(data))
};

const ui = new Uint8Array(20)
const d = new TextDecoder()
const saltRounds = 10
const createHash = () => d.decode(ui.map(_=>Math.floor(Math.random() * 95) + 33))
const holders = (n:number) => Array(n).fill('?').join(',');

//#endregion

//#region Session management

builder(Session, async (exec, { cookie }) => {
  
  const [sessionValue] = await exec<Zod.infer<typeof Session['Output']>>(`\
  SELECT s.value,s.exp,u.username,u.subjek,u.type,
  CASE
    WHEN u.\`type\` = 'counter' THEN c.nama
    WHEN u.\`type\` = 'driver' THEN d.nama
    WHEN u.\`type\` = 'kurir' THEN k.nama
  ELSE NULL
  END AS \`nama\`
  FROM session s
  LEFT JOIN user u ON u.id = s.user_id
  LEFT JOIN counter c ON u.\`type\` = 'counter' AND c.id = u.id
  LEFT JOIN driver d ON u.\`type\` = 'driver' AND d.id = u.id
  LEFT JOIN kurir k ON u.\`type\` = 'kurir' AND k.id = u.id
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
  
  const id = await exec<null>('insert into counter (`nama`) values (?)',[nama])
  
  const hash = await bcrypt.hash(passwd, saltRounds)
  const somes = await exec<null>(
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
  
  const { insertId } = await exec<null>(table.barang.insert(), vals)
  const promises = []
  
  const ivals = barang_details
    .map( detail => Object.values(Barang_DetailSchema.parse({ ...detail, barang_id: insertId })) )
    .flat()
  
  promises.push(exec( table.barang_detail.insert(barang_details.length) ,ivals))
  
  const [pos] = await exec(`select id from pos where id = ?`,[counter_id])
  
  // BUG MYSQL DRIVER
  // promises.push(exec( table.tracing.insert(), [tracing_data] ))
  promises.push(exec( 
    `insert into tracing (barang_id, subjek, tipe, aktif) 
    values (${insertId}, ${pos.id}, 'counter', 1)
  `))
  
  await Promise.all(promises)
  return Ok({ no_resi: insertId })
})

builder(TracingList,async (exec, { barang_id }) => {
  
  // query all tracing by id
  
  const [barang] = await exec<object>(
    table.barang.select() + ' where no_resi = ? limit 1', [barang_id]
  )
  
  const result = await exec<Zod.infer<typeof TracingSchema>>(`\
    SELECT t.tipe,t.subjek,t.aktif,
      COALESCE(c.nama, k.nama, d.nama, e.nama) AS nama
    FROM tracing t
    LEFT JOIN pos c ON t.tipe = 'counter' AND t.subjek = c.id
    LEFT JOIN kurir k ON t.tipe = 'kurir' AND t.subjek = k.id
    LEFT JOIN driver d ON t.tipe = 'driver' AND t.subjek = d.id
    LEFT JOIN driver e ON t.tipe = 'sampai' AND t.subjek = e.id
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

builder(GatewayOut, async (exec, { subjek, no_resi, tipe }) => {
  const [driver_query] = await exec(table.driver.select() + ' where id = ?  limit 1',[subjek])
  const barang_query = await exec(table.barang.select() + ` where no_resi in (${holders(no_resi.length)})`, no_resi)
  const [driver, barangs] = await Promise.all([driver_query, barang_query])

  // error handler
  if (!driver || barangs.length == 0){
    return None('Driver tidak ditemukan')
  }

  const { insertId: manifest_id} = await exec<null>(
    table.manifest.insert(), 
    [subjek, true]
  )
  const promises = []
  
  const tracingData = Array(no_resi.length).fill('').map((_,i)=>{
    return dataParser(TracingInsert, {
      aktif: 1, barang_id: no_resi[i], subjek: subjek, tipe
    })
  }).flat()
  const manifestData = Array(no_resi.length).fill('').map((_,i)=>{
    return dataParser(Barang_ManifestInsert,{
      barang_id: no_resi[i], keterangan: 'default from me', manifest_id,
    })
  }).flat()
  console.log(manifestData)
  await exec(
    `update tracing set aktif = 0 where aktif = 1 and barang_id in (${holders(no_resi.length)})`,
    no_resi
  )
  
  promises.push( exec<null>(
    table.tracing.insert(no_resi.length),
    tracingData,
  ), exec<null>(
    table.barang_manifest.insert(no_resi.length),
    manifestData,
  ))
  
  const result = ManifestDisplay.parseAsync({
    barang: barangs,
    driver,
    manifest: { id: manifest_id }
  })
  
  await Promise.all(promises)
  return Ok( await result )
})

builder(DriverGet, async (exec, { driver_id, tipe }) => {
  const [a] = await exec(
    table[tipe].select() + ' where id=? limit 1',
    [driver_id]
  )
  console.log(driver_id, tipe)
  if (!a) return None('Driver id tidak ditemukan')
  return Ok(a as any)
})

builder(GatewayIn, async (exec, { manifest_id, no_resi, counter_id }) => {
  
  const [pos] = await exec(`select id from pos where id = ?`,[counter_id])
  
  if (!pos) return None('Pos id tidak ditemukan')
  
  // deactivate manifest
  await exec(`update manifest set aktif = 0 where id = ?`,[manifest_id])
  // deactivate tracing
  await exec(
    `update tracing set aktif = 0 where aktif = 1 and barang_id in (${holders(no_resi.length)})`,
    no_resi
  )
  // add tracing
  const tracingData = Array(no_resi.length).fill('').map((_,i)=>{
    return dataParser(TracingInsert, {
      aktif: 1, barang_id: no_resi[i], subjek: pos.id, tipe: "counter"
    })
  }).flat()
  
  await exec<null>(
    table.tracing.insert(no_resi.length),
    tracingData,
  )
  
  return Ok({success:true})
})

builder(ManifestQuery, async (exec, { manifest_id }) => {

  const [manifest] = await exec(table.manifest.select({ id: true, driver_id: true }) + ' where id = ? limit 1',[manifest_id])
  if (!manifest) return None('Manifest tidak ditemukan')

  const [driver] = await exec(table.driver.select()+ ' where id = ? limit 1', [manifest.driver_id])
  if (!driver) return None('Driver tidak ditemukan')

  const barang = await exec(
    `SELECT t.*, b.* FROM barang_manifest t 
     LEFT JOIN barang b ON t.barang_id = b.no_resi
     WHERE t.manifest_id = ?`, [manifest_id]
  )

  if (barang.length == 0) 
    return None('Manifest tidak ada barang')

  return Ok(ManifestQuery.Output.parse({
    barang,
    driver,
    manifest,
  }))
})

builder(ManifestById, async (exec, { user_id }) => {

  const [user] = await exec(table.user.select({ subjek: true }) + ' where id=? limit 1', [user_id])

  if (!user) return None('User tidak ditemukan')

  const [kurir] = await exec(table.kurir.select({ nama: true, id: true })+' where id = ? limit 1', [user.subjek])
  
  if (!kurir) return None('Kurir tidak ditemukan')
 
  // get first active manifest by driver id
  const [manifest] = await exec('SELECT * from manifest m WHERE m.driver_id = ? ORDER BY dibuat DESC LIMIT 1',[kurir.id])
  
  if (manifest.length == 0) return None('Manifest tidak ditemukan')
  
  const tracings = await exec(
    `SELECT t.*, b.* FROM barang_manifest bm
     LEFT JOIN barang b ON bm.barang_id = b.no_resi
     LEFT JOIN tracing t ON t.barang_id = b.no_resi
     WHERE bm.manifest_id = ? AND t.dibuat = (
      SELECT dibuat
      FROM tracing
      WHERE barang_id = b.no_resi
      ORDER BY dibuat DESC
      LIMIT 1
    );
  `,[manifest.id])

  const result = await ManifestDisplayExt.parseAsync({
    barang: tracings,
    driver: kurir,
    manifest: { id: manifest.id }
  })

  return Ok(result)
})

// export async function finishBarang({ no_resi, subjek }: FinishBarang['Input']): Promise<Result<FinishBarang["Output"]>> {
builder(FinishBarang, async (exec, { subjek, no_resi }) => {

  const promises = []

  const ivals = Array(no_resi.length).fill(0).map((_,i)=>{
    return dataParser(TracingInsert, { subjek, tipe: 'sampai', barang_id: no_resi[i], aktif: 1 })
  }).flat()

  await exec(
    `update tracing set aktif = 0 where aktif = 1 and barang_id in (${holders(no_resi.length)})`,
    no_resi
  )

  promises.push(exec( table.tracing.insert(no_resi.length) ,ivals))
  
  await Promise.all(promises)
  return Ok({ success: true })
})

//#endregion Counter Barang

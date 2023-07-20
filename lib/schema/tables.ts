
import * as db from './database'
import * as views from './view'

type TableName<T extends string> = T extends `${infer Prefix}Schema` ? Lowercase<Prefix> : never;
type methods<T extends Zod.AnyZodObject> = {
  select: ( i?: { [P in keyof Zod.infer<T>]: string | true }, prefix?: string ) => string,
  insert: ( count?: number ) => string,
}

type Export = { [P in keyof typeof db as TableName<P>]: methods<typeof db[P]> }

let _tables: {[x: string]:any} = {}

const schema = Object.entries(db)

for (let i = 0;i < schema.length;i++) {
  const [ schemaName, schemaValue ] = schema[i]
  const table = schemaName.replace('Schema','').toLowerCase()
  
  _tables[table] = {
    
    select: (i,prefix) => {
      const select = i ? (Object.entries(i).map(([k,v])=>
        prefix ? prefix + '.' : '' +  typeof v == 'string' ? `${k} as ${v}` : `${k}`
      ).join(',')) : '*';
      return `SELECT ${select} FROM ${table}`
    },
    
    insert: (count = 1) => {
      // @ts-ignore
      const keys = Object.keys(views[schemaName.replace('Schema','Insert')].shape)
      const insert = '(' + keys.join(',') + ')';
      const placeholds = `(${Array(keys.length).fill('?').join(',')})`
      const icount = count == 1 ? placeholds : Array(count).fill(placeholds).join(',')
      return `INSERT INTO ${table} ${insert} values ${icount}`
    },
  } satisfies methods<Zod.AnyZodObject>
}

// console.log(_tables)
export const table = _tables as Export
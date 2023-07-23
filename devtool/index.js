// @ts-check
// watch file
// read any `const \w+`
// generate global type based on that

// @TODO
// add each important file one listener

import { watch } from "chokidar";
import { readFile, writeFile } from "fs";

const wt = Boolean(process.argv.find(e=>e=='--watch'))

const api = (vars)=>`\
import { ${vars.join(',')} } from "./handler/schema.ts"

declare global {
  namespace Api {
    ${vars.map(v=> `export type ${v} = Zod.infer<typeof ${v}["Output"]>` ).join('\n\t\t')}
  }
}`;

const db = (vars)=>`\
import { ${vars.join(',')} } from "./schema/database.ts"

declare global {
  namespace DB {
    ${vars.map(v=> `export type ${v} = Zod.infer<typeof ${v}>` ).join('\n\t\t')}
  }
}`

generate('lib/handler/schema.ts','lib/api.d.ts',api);
generate('lib/schema/database.ts','lib/db.d.ts',db);
wt ? watchFile('lib/handler/schema.ts',()=>generate('lib/handler/schema.ts','lib/api.d.ts',api)) : undefined;
wt ? watchFile('lib/schema/database.ts',()=>generate('lib/schema/database.ts','lib/db.d.ts',db)) : undefined;



let writing = false

/**
 * @param {string} target 
 * @param {string} output 
 * @param {(vars: string[])=>string} content 
 */
function generate(target,output,content) {
  if (writing) return console.log('busy, no file changed')
  
  writing = true
  readFile(target, (err, data) => {
    if (err) {
      writing = false
      return console.error(`[ERROR]`,err)
    }
    
    /** @type {string[]} */
    const iter = data.toString('utf-8').match(/export const \w+/g) ?? []
    const varnames = iter.map(e=>e.replace('export const ',''))    
    const result = content(varnames)
    
    writeFile(output,result,(err)=>{
      if (err) console.error('[ERROR]',err)
      writing = false
    })
  })
}

function watchFile(target,cb) {
  watch(target).on('change',cb)
}

import { watch } from "chokidar";
import { readFile, writeFile } from "fs";

const wt = Boolean(process.argv.find(e=>e=='--watch'))

const views = (vars)=>`\
import * as _view from "../schema/view.js"

declare global {
  namespace view {
    ${vars.map(v=> `export const ${v}: typeof _view.${v}` ).join('\n\t\t')}
    
    ${vars.map(v=> `export type ${v} = typeof ${v}` ).join('\n\t\t')}
  }
}`;

const db = (vars)=>`\
import * as _db from "../schema/database.js"

declare global {
  namespace db {
    ${vars.map(v=> `export const ${v}: typeof _db.${v}` ).join('\n\t\t')}
    
    ${vars.map(v=> `export type ${v} = Zod.infer<typeof ${v}>` ).join('\n\t\t')}
  }
}`

const handle = (vars)=>`\
import * as h from "../util/helper.js"

declare global {
  namespace handle {
    ${vars.map(v=> `export const ${v}: typeof h.${v}` ).join('\n\t\t')}
  }
}`

// let writing = false

build('lib-dyn/schema/view.js','lib-dyn/types/view.d.ts',views);
build('lib-dyn/schema/database.js','lib-dyn/types/db.d.ts',db);
build('lib-dyn/util/helper.js','lib-dyn/types/handle.d.ts',handle);

function build(target,output,content) {
  generate(target,output,content);
  wt ? watchFile(target,()=>generate(target,output,content)) : undefined;
}

/**
 * @param {string} target 
 * @param {string} output 
 * @param {(vars: string[])=>string} content 
 */
function generate(target,output,content) {
  // if (writing) return console.log('busy, no file changed')
  
  // writing = true
  readFile(target, (err, data) => {
    if (err) {
      // writing = false
      return console.error(`[ERROR]`,err)
    }
    
    /** @type {string[]} */
    const iter = data.toString('utf-8').match(/export const \w+/g) ?? []
    const varnames = iter.map(e=>e.replace('export const ',''))    
    const result = content(varnames)
    
    writeFile(output,result,(err)=>{
      if (err) console.error('[ERROR]',err)
      // writing = false
    })
  })
}

function watchFile(target,cb) {
  watch(target).on('change',cb)
}

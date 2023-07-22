

export const select = <T extends Zod.AnyZodObject>(pick: Partial<Record<keyof Zod.infer<T>, true | string>>) => {
  let select: string[] = []
  Object.entries(pick).forEach(([k,v])=>{
    select.push(typeof v == 'string' ? `${k} as ${v}` : `${k}`)
  })
  return `SELECT ${select.join(',')}`
}


export const schema = <T extends Zod.AnyZodObject>(pick: T, prefix?: string) => {
  let select: string[] = []
  Object.keys(pick.shape).forEach(k=>{
    select.push(`${prefix ? prefix + '.' : ''}\`${k}\``)
  })
  return select.join(',')
}

export const q = <T extends Zod.AnyZodObject>(pick: T) => {
  const len = Object.keys(pick.shape).length
  return Array(len).fill('?').join(',')
}
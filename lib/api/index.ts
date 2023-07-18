import * as handles from "../handler/schema"
import type { handles as handletype } from "../handler/handler"
import { Ok, ServerErr } from "../util"

type p = typeof handletype[0]['schema']

const builder = <T extends p>({ url }: T) => {
  return async (body: Zod.infer<T['Input']>, isBrowser: boolean): Promise<Result<Zod.infer<T['Output']>>> => {
    try {
      const result = await fetch( (isBrowser ? "https://api.banter.id" : "http://localhost:4040") + url ,{
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'content-type': 'application/json' }
      })
      
      return Ok(await result.json())
    } catch (error) {
      return ServerErr(error)
    }
  }
}

type ex = { [P in keyof typeof handles]: ReturnType<typeof builder<typeof handles[P]>> }

const Api: ex = {} as any
const keys = Object.keys(handles)

for (let i = 0;i < keys.length;i++) {
  // @ts-ignore
  Api[keys[i]] = builder(handles[keys[i]])
}

export default Api
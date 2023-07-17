import { BAD_REQUEST, SERVER_ERR } from "./errcode";

export const dateLog = () => {
  const t = new Date()
  t.setUTCHours( t.getUTCHours() + 7 )
  console.log(`[${t.toUTCString().split(' ').slice(0,5).join(' ')}]`)
}

export const Ok = <T>(data: T) => {
  return { success: true, data } satisfies Result<T>
}

export const Err = <T = any>(msg?: string, name?: string) => {
  return { success: false, error: { message: msg ?? 'Terjadi kesalahan, coba lagi', name: name ?? BAD_REQUEST } } satisfies Result<T>
}

export const ServerErr = <T = any>(error: any) => {
  dateLog()
  Object.keys(error).forEach(k=> console.error(k,"\t::",error[k]) )
  return { success: false, error: { message: 'Kesalahan Server, mohon coba beberapa saat lagi', name: SERVER_ERR } } satisfies Result<T>
}
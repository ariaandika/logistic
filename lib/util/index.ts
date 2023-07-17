
export const Ok = <T>(data: T) => {
  return { success: true, data } satisfies Result<T>
}

export const Err = <T = any>(msg?: string, name?: string) => {
  return { success: false, error: { message: msg ?? 'Terjadi kesalahan', name: name ?? 'BAD_REQUEST' } } satisfies Result<T>
}

export const ServerErr = <T = any>(error: any) => {
  console.error('[SERVER ERR]',error)
  return { success: false, error: { message: 'Terjadi kesalahan', name: 'SERVER_ERR' } } satisfies Result<T>
}
// @ts-nocheck
export{}
global.mysqlErrCodes = [
  'ERR_DUP_ENTRY'
]

global.BAD_REQUEST = "BAD_REQUEST"
global.SERVER_ERR = "SERVER_ERR"

/**
 * @typedef {import('./index.js')} i
 */

global.dateLog = () => {
  const t = new Date()
  t.setUTCHours( t.getUTCHours() + 7 )
  console.log(`[${t.toUTCString().split(' ').slice(0,5).join(' ')}]`)
}

global.Ok = (data) => {
  return { success: true, data }
}

global.None = (msg) => {
  return { success: null, message: msg ?? '' }
}

/** @type {i['Err']} */
global.Err = (msg, name) => {
  return { success: false, error: { message: msg ?? 'Terjadi kesalahan, coba lagi', name: name ?? BAD_REQUEST } }
}

/** @type {i['ServerErr']} */
global.ServerErr = (error) => {
  dateLog()
  console.log('[SERVER ERR]')
  console.error(error)
  console.log('[/SERVER ERR]')
  return { success: false, error: { message: 'Kesalahan Server, mohon coba beberapa saat lagi', name: SERVER_ERR } }
}

/** @type {i['safeParseInt']} */
global.safeParseInt = (val, fallback) => {
  if (val == null) return fallback ?? Err()
  const i = parseInt(val)
  if (fallback)
    return isNaN(i) ? fallback : i
  return isNaN(i) ? Err() : Ok(i)
}
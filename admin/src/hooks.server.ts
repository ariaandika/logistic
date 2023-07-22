import { redirect, type Handle } from "@sveltejs/kit";
import { Api } from "lib/handler/api";

const protectedUrl = {
  counter: '/counter',
  driver: '/driver',
  kurir: '/kurir',
}

export const handle = (async ({ event, resolve }) => {
  console.log("SERVER HOOK")
  
  const cookie = event.cookies.get('sessionId')
  const valid = cookie ? await Api.Session({ cookie }, false) : null
  
  if (valid && !valid.success) {
    return new Response('Terjadi Kesalahan, coba lagi')
  }
  
  const session = valid?.data
  
  // dont check authentication when changing authentication
  if (event.url.pathname.startsWith('/auth')){
    
  } else if (event.url.pathname == '/') {
    
    if (session) throw redirect(303, '/' + session.type)
    
  } else {
    
    if (!session) throw redirect(303, '/')
    
    const url = Object.entries(protectedUrl).find(([type,url])=>{
      return session.type == type && event.url.pathname.startsWith(url)
    })
    
    if (!url) throw redirect(303, '/' + session.type)
    
    event.locals.auth = { type: session.type, username: session.username, subjek: session.subjek }
  }
  
  return await resolve(event);
}) satisfies Handle;






import type { HandleServerError } from '@sveltejs/kit';

export const handleError = (({ error, event }) => {
  return {
    message: JSON.stringify(error),
    code: (error as any).code ?? 'UNKNOWN'
  };
}) satisfies HandleServerError;
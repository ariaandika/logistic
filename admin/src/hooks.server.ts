import { redirect, type Handle } from "@sveltejs/kit";
import { Api } from "lib/handler/api";

export const handle = (async ({ event, resolve }) => {
  console.log("SERVER HOOK")
  
  const cookie = event.cookies.get('sessionId')
  const valid = cookie ? await Api.Session({ cookie }, false) : null
  
  if (valid && !valid.success) {
    return new Response('Terjadi Kesalahan, coba lagi')
  }
  
  const session = valid?.data
  
  if (event.url.pathname == '/') {
    
    if (session) {
      console.log('SESSION SOME, GOTO COUNTER',session)
      throw redirect(303, '/' + session.type)
    }
    
  } else {
    
    if (!session) {
      console.log('SESSION NONE, GOTO /',session)
      throw redirect(303, '/')
    }
    
    event.locals.auth = { type: session.type, username: session.username }
  }
  console.log('PAGE',event.url.pathname)
  
  return await resolve(event);
}) satisfies Handle;






import type { HandleServerError } from '@sveltejs/kit';

export const handleError = (({ error, event }) => {
  return {
    message: JSON.stringify(error),
    code: (error as any).code ?? 'UNKNOWN'
  };
}) satisfies HandleServerError;
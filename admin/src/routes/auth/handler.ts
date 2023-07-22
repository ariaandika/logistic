import { redirect, type Action } from "@sveltejs/kit";
import { Api } from "lib/handler/api";

export const logout: Action = async ({ cookies }) => {
  const sessionId = cookies.get('sessionId')
  
  if (!sessionId) throw redirect(303, '/')
  
  await Api.Logout({ sessionId }, false)
  cookies.delete('sessionId')
  throw redirect(303, '/')
}

export const login: Action = async ({ request, cookies }) => {
    
  const form = await request.formData()
  const input = Object.fromEntries(form.entries()) as any
  
  const result = await Api.Login(input, false)
  
  if (result.success == false || result.success == null) {
    return { result: result, username: input.username ?? '' }
  }
  
  const session = result.data
  
  cookies.set('sessionId',session.sessionId)
  
  throw redirect(303,'/' + session.type)
}
import { type Actions, redirect } from "@sveltejs/kit";
import { Unwrap } from "lib/util";
import { Api } from "lib/handler/api";

export const actions: Actions = {
  login: async ({ request, cookies }) => {
    
    const form = await request.formData()
    const input = Object.fromEntries(form.entries()) as any
    
    const result = await Api.Login(input, false)
    
    
    if (!result.success || result.data == null) {
      return { result: result, username: input.username ?? '' }
    }
    
    const session = Unwrap(result.data)
    
    cookies.set('sessionId',session.sessionId)
    
    throw redirect(303,'/' + session.type)
  }
};
import { redirect, type Actions } from "@sveltejs/kit";
import { Api } from "lib/handler/api";

export const actions: Actions = {
  logout: async ({ cookies }) => {
    const sessionId = cookies.get('sessionId')
    
    if (!sessionId) throw redirect(303, '/')
    
    await Api.Logout({ sessionId }, false)
    cookies.delete('sessionId')
    
    throw redirect(303, '/')
  }
};
import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "../$types";
import { Api } from "lib/handler/api";

export const load: PageServerLoad = async ({ locals }) => {
  return locals.auth
};

export const actions: Actions = {
  logout: async ({ cookies }) => {
    const sessionId = cookies.get('sessionId')
    
    if (!sessionId) throw redirect(303, '/')
    
    await Api.Logout({ sessionId }, false)
    cookies.delete('sessionId')
    
    throw redirect(303, '/')
  }
};
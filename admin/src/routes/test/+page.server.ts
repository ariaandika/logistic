import api from "lib/api";
import type { Actions } from "@sveltejs/kit";
import { browser } from "$app/environment";

export const actions: Actions = {
  default: async ({ request }) => {
    
    const form = await request.formData()
    const data = Object.fromEntries(form.entries()) as { [x: string]: string }
    
    const result = await api.Login({ username: data.username ?? '', passwd: data.password ?? ''  },browser)
    
    return result
  }
};
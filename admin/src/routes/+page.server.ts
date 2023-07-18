import { type Actions, redirect } from "@sveltejs/kit";
import { Api } from "lib/api";

export const actions: Actions = {
  login: async ({ request }) => {
    
    const form = await request.formData()
    const data = Object.fromEntries(form.entries()) as any
    
    const result = await Api.Login(data, false)
    
    
    if (!result.success) {
      return { success: false, error: { message: ('username atau password salah') }, username: data.username ?? '' } as Result<any> & { username: string }
    }
    
    const userType = result.data.type
    
    throw redirect(304,'/' + userType)
  }
};
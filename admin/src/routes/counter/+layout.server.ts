import type { LayoutServerLoad } from "./$types";
import { Api } from "lib/handler/api";

export const load: LayoutServerLoad = async ({ locals: { auth } }) => {
  return { 
    queries: await Api.BarangCounterList({ subjek: auth.subjek }, false) ,
    auth,
  }
};
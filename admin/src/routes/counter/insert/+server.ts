import { json, type RequestHandler } from "@sveltejs/kit";
import { Api } from "lib/handler/api";

export const POST: RequestHandler = async ({ request }) => {
  
  const data = await request.json()
  
  const result = await Api.BarangInsert(data, false)
  return json(result);
};
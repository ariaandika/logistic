import type { Actions } from "@sveltejs/kit";
import { Api } from "lib/handler/api";
import type { TracingList } from "lib/handler/schema";
import { Err, Unwrap, safeParseInt } from "lib/util";


export const actions: Actions = {
  default: async ({ request }) => {    
    const body = await request.formData()
    const valid = safeParseInt(body.get('id'))
    
    if (!valid.success) {
      return Err<typeof TracingList["Output"]>()
    }
    
    return await Api.TracingList({ barang_id: Unwrap(valid.data) }, false )
  }
};
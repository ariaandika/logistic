import type { Handle } from "@sveltejs/kit";

export const handle = (async ({ event, resolve }) => {
  console.log("CLIENT HOOK")
  return await resolve(event)
}) satisfies Handle;
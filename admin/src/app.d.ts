// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
/// <reference path="../../lib/global.d.ts"/>

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			auth: Pick<Zod.infer<typeof import("lib/schema/database").UserSchema>,'username'|'type'>
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};

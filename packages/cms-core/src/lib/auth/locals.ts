import type { Auth } from '../types/index';

/**
 * `@auth/sveltekit` declares `App.Locals.auth` as its own session getter, and
 * cms-core keeps its own `Auth` on the same key, so an app using both fails
 * type-check on any direct `locals.auth` read or write. cms-core reads and
 * writes through this typed view instead of `event.locals.auth` directly, so
 * both libraries can coexist without either widening the shared global type.
 *
 * At runtime the two also coexist: when `locals.auth` already holds a
 * function (another library's getter), cms-core's `Auth` is kept on
 * `locals.aphexAuth` instead of overwriting it, and reads look there first.
 * An app without such a getter sees cms-core's `Auth` on `locals.auth` as
 * before.
 */
export function aphexLocals(locals: App.Locals): { auth?: Auth } {
	const store = locals as unknown as { auth?: unknown; aphexAuth?: Auth };
	return {
		get auth(): Auth | undefined {
			if (store.aphexAuth) return store.aphexAuth;
			return typeof store.auth === 'function' ? undefined : (store.auth as Auth | undefined);
		},
		set auth(value: Auth | undefined) {
			if (typeof store.auth === 'function') {
				store.aphexAuth = value;
			} else {
				store.auth = value;
			}
		}
	};
}

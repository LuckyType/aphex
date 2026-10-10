/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
	plugins: [svelte()],
	build: {
		lib: {
			entry: {
				index: resolve(__dirname, 'src/index.ts'),
				components: resolve(__dirname, 'src/components/index.ts'),
				routes: resolve(__dirname, 'src/routes/index.ts'),
				types: resolve(__dirname, 'src/types.ts')
			},
			formats: ['es']
		},
		rollupOptions: {
			external: ['svelte', '@sveltejs/kit', 'drizzle-orm', 'postgres', 'sharp'],
			output: {
				preserveModules: true,
				preserveModulesRoot: 'src'
			}
		},
		target: 'node18'
	},
	resolve: {
		// Component tests mount in jsdom, so they need svelte's client build, not
		// the server one Node resolves by default (tests/field-a11y.svelte.spec.ts).
		...(process.env.VITEST ? { conditions: ['browser'] } : {}),
		alias: {
			// @aphexcms/ui read as source imports itself through its own `@lib`
			// alias, as tsconfig.json's paths explain.
			'@lib': resolve(__dirname, '../ui/src/lib'),
			...(process.env.VITEST
				? {
						'$app/navigation': resolve(__dirname, 'tests/stubs/app-navigation.ts'),
						'$app/state': resolve(__dirname, 'tests/stubs/app-state.ts')
					}
				: {}),
			$lib: resolve('./src/lib'),
			$app: resolve(__dirname, '../../src/app'),
			$env: resolve(__dirname, '../../src/env')
		}
	},
	test: {
		server: {
			deps: {
				// Libraries that ship .svelte files, which Node's loader cannot import:
				// Vite compiles them for the component tests instead.
				inline: [/bits-ui/, /svelte-sonner/, /mode-watcher/, /@lucide\/svelte/, /@dnd-kit\/svelte/]
			}
		}
	}
});

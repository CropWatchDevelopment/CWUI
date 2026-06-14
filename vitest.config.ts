import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		// Run unit tests against Svelte's browser build so reactivity helpers
		// (svelte/reactivity) behave like they do in the app.
		conditions: ['browser']
	},
	test: {
		include: ['src/**/*.{test,spec}.ts'],
		// The refresh scheduler is SSR-guarded on `document`, so unit tests
		// need a DOM-like environment.
		environment: 'happy-dom'
	}
});

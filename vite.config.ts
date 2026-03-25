import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { cloudflare } from '@cloudflare/vite-plugin';

export default defineConfig({
	plugins: [cloudflare(), tailwindcss(), sveltekit()],
	server: {
		watch: {
			ignored: ['**/.wrangler/**'],
		},
	},
	ssr: {
		noExternal: ['svelte-maplibre-gl', 'maplibre-gl'],
	},
	build: {
		target: 'esnext',
		chunkSizeWarningLimit: 1200,
		sourcemap: true,
	},
	optimizeDeps: {
		include: ['maplibre-gl', 'svelte-maplibre-gl'],
	},
});

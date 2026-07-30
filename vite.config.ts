import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [tailwindcss(), enhancedImages(), sveltekit()],
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

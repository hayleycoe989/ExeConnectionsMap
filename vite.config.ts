import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	// enhancedImages() must precede sveltekit() so it can rewrite <enhanced:img>
	// tags before SvelteKit processes them. It generates avif/webp + intrinsic
	// dimensions for the partner logos at build time.
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

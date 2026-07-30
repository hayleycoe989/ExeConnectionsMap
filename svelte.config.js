import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			platformProxy: {
				persist: true,
			},
		}),
		alias: {
			$lib: 'src/lib',
			'@/*': 'src/lib',
		},
	},
	compilerOptions: {
		runes: true,
	},
};

export default config;

<script lang="ts">
	import '../app.css';
	import { Toaster } from 'svelte-sonner';

	let { children } = $props();
</script>

<svelte:head>
	<title>River Exe Stakeholder Map</title>
	<meta
		name="description"
		content="Stakeholder mapping tool for the River Exe catchment — University of Exeter"
	/>
</svelte:head>

<a
	href="#map"
	class="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2
	       focus:px-3 focus:py-2 focus:bg-background focus:border focus:rounded-md focus:text-sm focus:font-medium"
>
	Skip to map
</a>

{@render children()}

<Toaster richColors position="top-right" />

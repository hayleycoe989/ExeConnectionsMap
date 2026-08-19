<script lang="ts">
  import { browser } from '$app/environment';
  import { Menu } from '@lucide/svelte';
  import { store } from '$lib/store.svelte';
  import ConnectionPanel from '$lib/components/ConnectionPanel.svelte';
  import ConnectionForm from '$lib/components/ConnectionForm.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  store.init(data.connections, data.canPublish);

  let panelOpen = $state(false);

  const mapPromise = browser ? import('$lib/components/Map.svelte') : null;
</script>




<div class="relative md:flex w-screen h-screen overflow-hidden">
	{#if panelOpen}
		<button
			type="button"
			class="md:hidden fixed inset-0 z-30 bg-ink/40 backdrop-blur-[1px]"
			aria-label="Close panel"
			tabindex="-1"
			onclick={() => (panelOpen = false)}
		></button>
	{/if}

	<ConnectionPanel open={panelOpen} onClose={() => (panelOpen = false)} />

	<main id="map" class="relative h-full w-full md:flex-1 md:min-w-0" aria-label="Map">
		{#if mapPromise}
			{#await mapPromise}
				<div class="absolute inset-0 flex items-center justify-center bg-background">
					<div class="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
				</div>
			{:then mod}
				{@const MapComponent = mod.default}
				<MapComponent />
			{/await}
		{/if}
	</main>

	<button
		type="button"
		onclick={() => (panelOpen = true)}
		class="md:hidden fixed top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-2 rounded-sm
		       bg-paper/95 backdrop-blur-sm border border-rule shadow-sm text-ink text-[13px] font-serif
		       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
		aria-label="Open connections panel"
		aria-controls="connection-panel"
		aria-expanded={panelOpen}
	>
		<Menu class="w-4 h-4" />
		Connections
	</button>
</div>

{#if store.mode.type === 'form'}
	<ConnectionForm />
{/if}

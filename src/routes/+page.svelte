<script lang="ts">
	import { browser } from '$app/environment';
	import { store } from '$lib/store.svelte';
	import Map from '$lib/components/Map.svelte';
	import StakeholderPanel from '$lib/components/StakeholderPanel.svelte';
	import StakeholderForm from '$lib/components/StakeholderForm.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	store.init(data.stakeholders);
</script>

<div class="flex w-screen h-screen overflow-hidden">
	<StakeholderPanel />

	<main id="map" class="flex-1 min-w-0 h-full relative" aria-label="Map">
		{#if browser}
			<Map />
		{/if}
	</main>
</div>

{#if store.mode.type === 'form'}
	<StakeholderForm />
{/if}

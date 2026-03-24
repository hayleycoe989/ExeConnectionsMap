<script lang="ts">
	import { CheckSquare, X } from '@lucide/svelte';
	import { store } from '$lib/store.svelte';

	const activeStakeholder = $derived.by(() => {
		const mode = store.mode;
		if (mode.type !== 'lsoa-selection') return null;
		return store.stakeholders.find((s) => s.id === mode.stakeholderId) ?? null;
	});

	const assignedCount = $derived(activeStakeholder?.lsoaCodes.length ?? 0);
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape' && store.mode.type === 'lsoa-selection') {
			store.finishSelectionMode();
		}
	}}
/>

{#if store.mode.type === 'lsoa-selection' && activeStakeholder}
	<div
		class="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2.5
		       bg-emerald-700 text-white rounded-lg shadow-lg text-sm font-medium
		       border border-emerald-600 max-w-[90vw]"
		role="status"
		aria-live="polite"
	>
		<CheckSquare class="w-4 h-4 shrink-0 text-emerald-200" />
		<span class="truncate">
			<span class="text-emerald-200">Selecting for:</span>
			<span class="ml-1">{activeStakeholder.name}</span>
		</span>
		<span class="shrink-0 bg-emerald-800 rounded px-1.5 py-0.5 text-xs tabular-nums">
			{assignedCount}
		</span>
		<button
			type="button"
			onclick={() => store.finishSelectionMode()}
			class="shrink-0 bg-emerald-600 hover:bg-emerald-500 transition-colors px-3 py-1 rounded text-xs font-semibold"
		>
			Done
		</button>
		<button
			type="button"
			onclick={() => store.finishSelectionMode()}
			class="shrink-0 hover:text-emerald-200 transition-colors"
			aria-label="Cancel selection"
		>
			<X class="w-3.5 h-3.5" />
		</button>
	</div>
{/if}

<script lang="ts">
	import { Pencil, X, Trash2 } from '@lucide/svelte';
	import { store } from '$lib/store.svelte';

	const activeStakeholder = $derived.by(() => {
		const mode = store.mode;
		if (mode.type !== 'draw') return null;
		return store.stakeholders.find((s) => s.id === mode.stakeholderId) ?? null;
	});

	const hasArea = $derived(activeStakeholder?.area != null);

	function clearPolygon() {
		if (!activeStakeholder) return;
		store.setStakeholderArea(activeStakeholder.id, null);
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape' && store.mode.type === 'draw') {
			store.finishDrawMode();
		}
	}}
/>

{#if store.mode.type === 'draw' && activeStakeholder}
	<div
		class="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2.5
		       bg-paper text-ink rounded-sm shadow-sm border border-rule max-w-[92vw]"
		role="status"
		aria-live="polite"
	>
		<Pencil class="w-3.5 h-3.5 shrink-0 text-muted-ink" />
		<span class="font-serif text-[13px] truncate">
			<span class="text-muted-ink">Drawing area for:</span>
			<span class="ml-1 text-ink">{activeStakeholder.name}</span>
		</span>
		<span class="shrink-0 text-[10px] uppercase tracking-widest text-muted-ink">
			{hasArea ? 'editing' : 'click to add vertices'}
		</span>
		{#if hasArea}
			<button
				type="button"
				onclick={clearPolygon}
				class="shrink-0 flex items-center gap-1 px-2 py-1 rounded-sm text-[11px] text-muted-ink
				       border border-rule hover:text-ink hover:border-ink/40 transition-colors"
				title="Clear and redraw"
			>
				<Trash2 class="w-3 h-3" />
				Clear
			</button>
		{/if}
		<button
			type="button"
			onclick={() => store.finishDrawMode()}
			class="shrink-0 px-3 py-1 rounded-sm text-[11px] font-serif bg-primary text-primary-foreground
			       hover:opacity-90 transition-opacity"
		>
			Done
		</button>
		<button
			type="button"
			onclick={() => store.finishDrawMode()}
			class="shrink-0 text-muted-ink hover:text-ink transition-colors"
			aria-label="Cancel"
		>
			<X class="w-3.5 h-3.5" />
		</button>
	</div>
{/if}

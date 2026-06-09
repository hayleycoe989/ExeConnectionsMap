<script lang="ts">
	import { Pencil, X, Trash2 } from '@lucide/svelte';
	import { store } from '$lib/store.svelte';

	const activeConnection = $derived.by(() => {
		const mode = store.mode;
		if (mode.type !== 'draw') return null;
		return store.connections.find((s) => s.id === mode.connectionId) ?? null;
	});

	const hasArea = $derived(activeConnection?.area != null);

	function clearPolygon() {
		if (!activeConnection) return;
		store.setConnectionArea(activeConnection.id, null);
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape' && store.mode.type === 'draw') {
			store.finishDrawMode();
		}
	}}
/>

{#if store.mode.type === 'draw' && activeConnection}
	<div
		class="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2.5
		       bg-paper/95 backdrop-blur-sm text-ink rounded-sm shadow-sm border border-rule max-w-[92vw]"
		role="status"
		aria-live="polite"
	>
		<Pencil class="w-3.5 h-3.5 shrink-0 text-muted-ink" />
		<span class="font-serif text-[13px] truncate">
			<span class="text-muted-ink">Drawing area for:</span>
			<span class="ml-1 text-ink">{activeConnection.name}</span>
		</span>
		<span class="shrink-0 text-[10px] uppercase tracking-widest text-muted-ink">
			{hasArea ? 'editing' : 'click to add vertices'}
		</span>
		{#if hasArea}
			<button
				type="button"
				onclick={clearPolygon}
				class="shrink-0 flex items-center gap-1 px-2 py-1 rounded-sm text-[11px] text-muted-ink
				       border border-rule hover:text-ink hover:border-ink/40 transition-colors
				       focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
			       hover:opacity-90 transition-opacity
			       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
		>
			Done
		</button>
		<button
			type="button"
			onclick={() => store.finishDrawMode()}
			class="shrink-0 text-muted-ink hover:text-ink transition-colors rounded-sm
			       focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
			aria-label="Cancel"
		>
			<X class="w-3.5 h-3.5" />
		</button>
	</div>
{/if}

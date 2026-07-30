<script lang="ts">
	import { Pencil, Trash2, ChevronDown, ChevronRight } from '@lucide/svelte';
	import { store } from '$lib/store.svelte';
	import type { Connection } from '$lib/types';

	let { connection }: { connection: Connection } = $props();

	const isActive = $derived(
		store.mode.type === 'draw' && store.mode.connectionId === connection.id,
	);

	let expanded = $state(false);
	let confirmDelete = $state(false);
</script>

<div
	class="border-l-2 transition-all duration-150
	       {isActive ? 'border-primary' : 'border-transparent hover:border-rule'}"
>
	<div class="flex items-center justify-between gap-1 min-w-0 pl-3 py-2">
		<button
			type="button"
			onclick={() => (expanded = !expanded)}
			class="flex items-center gap-1.5 min-w-0 flex-1 text-left rounded-sm
			       focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
			aria-expanded={expanded}
		>
			{#if expanded}
				<ChevronDown class="w-3 h-3 text-muted-ink/70 shrink-0" />
			{:else}
				<ChevronRight class="w-3 h-3 text-muted-ink/70 shrink-0" />
			{/if}
			<span class="font-serif text-sm text-ink leading-snug truncate">
				{connection.name}
			</span>
		</button>

		<div class="flex items-center gap-0.5 shrink-0">
			<button
				type="button"
				onclick={() => isActive ? store.finishDrawMode() : store.enterDrawMode(connection.id)}
				class="p-1.5 rounded-sm transition-colors
				       focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
				       {isActive
					? 'text-primary hover:opacity-80 hover:bg-accent'
					: 'text-muted-ink hover:text-ink hover:bg-accent'}"
				aria-label={isActive ? 'Finish editing area' : 'Edit area'}
				title={isActive ? 'Done' : 'Edit area'}
			>
				<Pencil class="w-3 h-3" />
			</button>

			{#if confirmDelete}
				<button
					type="button"
					onclick={() => { store.deleteConnection(connection.id); confirmDelete = false; }}
					class="px-2 py-1 rounded-sm text-[10px] text-destructive border border-destructive/40 bg-destructive/10
					       hover:bg-destructive/20 transition-colors
					       focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
				>
					Delete
				</button>
				<button
					type="button"
					onclick={() => (confirmDelete = false)}
					class="px-2 py-1 rounded-sm text-[10px] text-muted-ink hover:text-ink transition-colors
					       focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
				>
					Cancel
				</button>
			{:else}
				<button
					type="button"
					onclick={() => (confirmDelete = true)}
					class="p-1.5 rounded-sm text-muted-ink/70 hover:text-destructive hover:bg-accent transition-colors
					       focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
					aria-label="Delete connection"
				>
					<Trash2 class="w-3 h-3" />
				</button>
			{/if}
		</div>
	</div>

	{#if expanded}
		<div class="pl-7 pr-2 pb-2.5 space-y-0.5">
			<p class="font-serif text-[11px] text-muted-ink leading-snug">
				{connection.role}
			</p>
			{#if connection.categories.length > 0}
				<p class="text-[10px] text-muted-ink/80">
					{connection.categories.join(' · ')}
				</p>
			{/if}
			<p class="text-[10px] text-muted-ink/80 italic">
				{connection.area ? 'Area drawn' : 'No area drawn'}
			</p>
			{#if connection.link}
				<a
					href={connection.link}
					target="_blank"
					rel="noopener"
					class="text-[10px] text-muted-ink hover:text-ink underline underline-offset-2 block truncate
					       focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm"
				>{connection.link}</a>
			{/if}
		</div>
	{/if}
</div>

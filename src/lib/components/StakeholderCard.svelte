<script lang="ts">
	import { Pencil, Trash2, ChevronDown, ChevronRight } from '@lucide/svelte';
	import { store } from '$lib/store.svelte';
	import type { Stakeholder } from '$lib/types';

	let { stakeholder }: { stakeholder: Stakeholder } = $props();

	const isActive = $derived(
		store.mode.type === 'lsoa-selection' && store.mode.stakeholderId === stakeholder.id,
	);

	let expanded = $state(false);
	let confirmDelete = $state(false);
</script>

<div
	class="border-l-2 transition-all duration-150
	       {isActive ? 'border-emerald-400' : 'border-transparent hover:border-sidebar-border'}"
>
	<!-- Always-visible row: name + chevron + actions -->
	<div class="flex items-center justify-between gap-1 min-w-0 pl-3 py-2">
		<button
			type="button"
			onclick={() => (expanded = !expanded)}
			class="flex items-center gap-1.5 min-w-0 flex-1 text-left"
			aria-expanded={expanded}
		>
			{#if expanded}
				<ChevronDown class="w-3 h-3 text-sidebar-foreground/45 shrink-0" />
			{:else}
				<ChevronRight class="w-3 h-3 text-sidebar-foreground/45 shrink-0" />
			{/if}
			<span class="font-serif text-sm text-sidebar-foreground leading-snug truncate">
				{stakeholder.name}
			</span>
		</button>

		<div class="flex items-center gap-0.5 shrink-0">
			<button
				type="button"
				onclick={() => isActive ? store.finishSelectionMode() : store.enterSelectionMode(stakeholder.id)}
				class="p-1.5 rounded transition-colors
				       {isActive
					? 'text-emerald-400 hover:text-emerald-300 hover:bg-sidebar-accent'
					: 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent'}"
				aria-label={isActive ? 'Finish selecting areas' : 'Edit areas'}
				title={isActive ? 'Done' : 'Edit areas'}
			>
				<Pencil class="w-3 h-3" />
			</button>

			{#if confirmDelete}
				<button
					type="button"
					onclick={() => { store.deleteStakeholder(stakeholder.id); confirmDelete = false; }}
					class="px-2 py-1 rounded text-[10px] bg-red-900/50 text-red-300 hover:bg-red-900/70 transition-colors"
				>
					Delete
				</button>
				<button
					type="button"
					onclick={() => (confirmDelete = false)}
					class="px-2 py-1 rounded text-[10px] text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
				>
					Cancel
				</button>
			{:else}
				<button
					type="button"
					onclick={() => (confirmDelete = true)}
					class="p-1.5 rounded text-sidebar-foreground/50 hover:text-red-400 hover:bg-sidebar-accent transition-colors"
					aria-label="Delete stakeholder"
				>
					<Trash2 class="w-3 h-3" />
				</button>
			{/if}
		</div>
	</div>

	<!-- Expanded details -->
	{#if expanded}
		<div class="pl-7 pr-2 pb-2.5 space-y-0.5">
			<p class="font-serif text-[11px] text-sidebar-foreground/75 leading-snug">
				{stakeholder.role}
			</p>
			{#if stakeholder.categories.length > 0}
				<p class="text-[10px] text-sidebar-foreground/65">
					{stakeholder.categories.join(' · ')}
				</p>
			{/if}
			<p class="text-[10px] text-sidebar-foreground/60">
				{stakeholder.lsoaCodes.length} {stakeholder.lsoaCodes.length === 1 ? 'area' : 'areas'} selected
			</p>
			{#if stakeholder.link}
				<a
					href={stakeholder.link}
					target="_blank"
					rel="noopener"
					class="text-[10px] text-sidebar-foreground/60 hover:text-sidebar-foreground underline underline-offset-2 block truncate"
				>{stakeholder.link}</a>
			{/if}
		</div>
	{/if}
</div>

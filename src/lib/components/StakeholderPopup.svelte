<script lang="ts">
	import { X, Pencil, Trash2 } from '@lucide/svelte';
	import { store } from '$lib/store.svelte';

	let { stakeholderId }: { stakeholderId: string } = $props();

	const stakeholder = $derived(store.stakeholders.find((s) => s.id === stakeholderId));

	let confirmDelete = $state(false);

	function handleEdit(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (!stakeholder) return;
		store.enterDrawMode(stakeholder.id);
	}

	function handleDelete(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (!stakeholder) return;
		store.deleteStakeholder(stakeholder.id);
	}
</script>

{#if stakeholder}
	<div class="bg-paper border border-rule rounded-sm shadow-sm w-60 text-xs overflow-hidden">
		<div class="px-3.5 py-3">
			<div class="flex items-start justify-between gap-2 mb-2">
				<div class="min-w-0 flex-1">
					{#if stakeholder.link}
						<a
							href={stakeholder.link}
							target="_blank"
							rel="noopener"
							class="font-serif text-sm text-ink hover:underline underline-offset-2 block truncate"
						>{stakeholder.name}</a>
					{:else}
						<p class="font-serif text-sm text-ink leading-snug truncate">{stakeholder.name}</p>
					{/if}
				</div>
				<button
					type="button"
					onclick={() => store.selectStakeholder(null)}
					class="p-0.5 text-muted-ink hover:text-ink transition-colors shrink-0"
					aria-label="Close"
				>
					<X class="w-3.5 h-3.5" />
				</button>
			</div>

			<p class="font-serif text-[11px] text-muted-ink leading-relaxed mb-2">{stakeholder.role}</p>

			{#if stakeholder.categories.length > 0}
				<p class="text-[10px] uppercase tracking-widest text-muted-ink mb-2.5">
					{stakeholder.categories.join(' · ')}
				</p>
			{/if}

			<div class="flex items-center gap-1.5 pt-2 border-t border-rule">
				<button
					type="button"
					onclick={handleEdit}
					class="flex items-center gap-1 px-2 py-1 rounded-sm text-[11px] text-ink
					       hover:bg-accent transition-colors"
				>
					<Pencil class="w-3 h-3" />
					Edit area
				</button>
				{#if confirmDelete}
					<div class="flex items-center gap-1 ml-auto">
						<button
							type="button"
							onclick={handleDelete}
							class="px-2 py-1 rounded-sm text-[10px] text-destructive border border-destructive/40 hover:bg-destructive/10 transition-colors"
						>
							Delete
						</button>
						<button
							type="button"
							onclick={() => (confirmDelete = false)}
							class="px-2 py-1 rounded-sm text-[10px] text-muted-ink hover:text-ink transition-colors"
						>
							Cancel
						</button>
					</div>
				{:else}
					<button
						type="button"
						onclick={() => (confirmDelete = true)}
						class="ml-auto p-1 rounded-sm text-muted-ink hover:text-destructive transition-colors"
						aria-label="Delete stakeholder"
					>
						<Trash2 class="w-3 h-3" />
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

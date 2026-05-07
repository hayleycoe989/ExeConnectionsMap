<script lang="ts">
	import { UserPlus, ChevronDown, ChevronRight, Eye, EyeOff } from '@lucide/svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { store } from '$lib/store.svelte';
	import type { Stakeholder } from '$lib/types';
	import StakeholderCard from './StakeholderCard.svelte';

	// Group stakeholders by primary category.
	const grouped = $derived.by(() => {
		const groups = new Map<string, Stakeholder[]>();
		for (const s of store.stakeholders) {
			const cat = s.categories[0] ?? 'Uncategorised';
			if (!groups.has(cat)) groups.set(cat, []);
			groups.get(cat)!.push(s);
		}
		return [...groups.entries()].sort(([a], [b]) => {
			if (a === 'Uncategorised') return 1;
			if (b === 'Uncategorised') return -1;
			return a.localeCompare(b);
		});
	});

	let closedCategories = $state(new Set<string>());

	function toggleCategorySection(cat: string) {
		const next = new Set(closedCategories);
		if (next.has(cat)) {
			next.delete(cat);
		} else {
			next.add(cat);
		}
		closedCategories = next;
	}
</script>

<aside
	class="flex flex-col w-72 shrink-0 h-full border-r border-sidebar-border bg-sidebar overflow-hidden"
	aria-label="Stakeholder panel"
>
	<!-- Header -->
	<div class="px-6 pt-7 pb-5 text-sidebar-foreground">
		<h1 class="font-serif text-2xl leading-tight tracking-tight text-sidebar-foreground">
			River Exe<br />Stakeholder Map
		</h1>
		<div class="mt-3 h-px w-10 bg-sidebar-foreground/30"></div>
		<p class="mt-4 text-xs leading-relaxed text-sidebar-foreground/75 font-serif italic">
			Register stakeholders and draw the area of the river system that falls within their interest.
		</p>
	</div>

	<div class="px-6 pb-5">
		<button
			type="button"
			onclick={store.openForm}
			disabled={store.mode.type === 'form'}
			class="w-full flex items-center justify-center gap-2 py-2 text-sm font-serif
			       border border-sidebar-border text-sidebar-foreground rounded-sm
			       hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
			       disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
		>
			<UserPlus class="w-3.5 h-3.5" />
			Add stakeholder
		</button>
	</div>

	<div class="h-px bg-sidebar-border mx-6"></div>

	<!-- Stakeholder list -->
	<div class="flex-1 min-h-0">
		<ScrollArea class="h-full">
			<div class="px-5 py-4">
				{#if store.stakeholders.length === 0}
					<p class="font-serif italic text-sm text-sidebar-foreground/65 pt-2 px-1">
						No stakeholders added yet.
					</p>
				{:else}
					<p class="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/65 pb-3 px-1">
						{store.stakeholders.length} {store.stakeholders.length === 1 ? 'stakeholder' : 'stakeholders'}
					</p>

					{#each grouped as [category, stakeholders] (category)}
						{@const isOpen = !closedCategories.has(category)}
						{@const isHidden = store.hiddenCategories.has(category)}
						<div class="mb-3">
							<!-- Category section header -->
							<div class="flex items-center gap-1 py-1">
								<button
									type="button"
									onclick={() => toggleCategorySection(category)}
									class="flex items-center gap-1.5 flex-1 min-w-0 text-left group"
									aria-expanded={isOpen}
								>
									{#if isOpen}
										<ChevronDown class="w-3 h-3 text-sidebar-foreground/45 shrink-0" />
									{:else}
										<ChevronRight class="w-3 h-3 text-sidebar-foreground/45 shrink-0" />
									{/if}
									<span class="text-[10px] uppercase tracking-[0.18em] transition-colors
									             {isHidden ? 'text-sidebar-foreground/30 line-through' : 'text-sidebar-foreground/65 group-hover:text-sidebar-foreground/85'}">
										{category}
										<span class="ml-1 {isHidden ? 'text-sidebar-foreground/25' : 'text-sidebar-foreground/45'}">({stakeholders.length})</span>
									</span>
								</button>
								<button
									type="button"
									onclick={() => store.toggleCategoryVisibility(category)}
									class="p-1 rounded-sm transition-colors shrink-0
									       {isHidden
										? 'text-sidebar-foreground/30 hover:text-sidebar-foreground/60'
										: 'text-sidebar-foreground/45 hover:text-sidebar-foreground/75'}"
									aria-label={isHidden ? `Show ${category} on map` : `Hide ${category} from map`}
									title={isHidden ? 'Show on map' : 'Hide from map'}
								>
									{#if isHidden}
										<EyeOff class="w-3 h-3" />
									{:else}
										<Eye class="w-3 h-3" />
									{/if}
								</button>
							</div>

							{#if isOpen}
								<div class="mt-1 space-y-px">
									{#each stakeholders as stakeholder (stakeholder.id)}
										<StakeholderCard {stakeholder} />
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				{/if}
			</div>
		</ScrollArea>
	</div>
</aside>

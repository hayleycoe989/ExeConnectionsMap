<script lang="ts">
	import { Eye, EyeOff, ChevronUp, ChevronDown } from '@lucide/svelte';
	import { CATEGORY_COLOURS } from '$lib/mapConfig';
	import { CONNECTION_CATEGORIES } from '$lib/types';
	import { store } from '$lib/store.svelte';

	let open = $state(true);
</script>

<div class="absolute top-3 right-3 z-10">
	<div class="bg-paper/95 backdrop-blur-sm border border-rule rounded-sm shadow-sm text-xs w-44 overflow-hidden">
		<button
			type="button"
			onclick={() => (open = !open)}
			class="flex items-center justify-between w-full px-3 py-2 text-left transition-colors hover:bg-accent/50
			       focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset"
			aria-expanded={open}
		>
			<span class="font-serif text-[13px] text-ink">Categories</span>
			{#if open}
				<ChevronUp class="w-3.5 h-3.5 text-muted-ink" />
			{:else}
				<ChevronDown class="w-3.5 h-3.5 text-muted-ink" />
			{/if}
		</button>

		{#if open}
			<div class="px-2 pb-2 border-t border-rule space-y-0.5 pt-1">
				{#each CONNECTION_CATEGORIES as cat (cat)}
					{@const hidden = store.hiddenCategories.has(cat)}
					<button
						type="button"
						onclick={() => store.toggleCategoryVisibility(cat)}
						class="flex items-center gap-2 w-full px-2 py-1 rounded-sm text-left
						       hover:bg-accent transition-colors group
						       focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
						aria-pressed={!hidden}
						title={hidden ? `Show ${cat}` : `Hide ${cat}`}
					>
						<span
							class="w-3.5 h-3 rounded-xs border border-rule shrink-0 transition-opacity"
							style:background-color={CATEGORY_COLOURS[cat]}
							style:opacity={hidden ? 0.25 : 1}
						></span>
						<span
							class="font-serif text-[11px] flex-1 transition-colors {hidden
								? 'text-muted-ink line-through'
								: 'text-ink'}"
						>
							{cat}
						</span>
						{#if hidden}
							<EyeOff class="w-3 h-3 text-muted-ink shrink-0" />
						{:else}
							<Eye class="w-3 h-3 text-muted-ink/70 group-hover:text-muted-ink shrink-0" />
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>

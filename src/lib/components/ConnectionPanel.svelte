<script lang="ts">
	import { UserPlus, ChevronDown, ChevronRight, Eye, EyeOff, X } from '@lucide/svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { store } from '$lib/store.svelte';
	import type { Connection } from '$lib/types';
	import ConnectionCard from './ConnectionCard.svelte';

	let { open = false, onClose = () => {} }: { open?: boolean; onClose?: () => void } = $props();

	let closeButton = $state<HTMLButtonElement | undefined>();

	$effect(() => {
		if (open) closeButton?.focus();
	});

	const grouped = $derived.by(() => {
		const groups = new Map<string, Connection[]>();
		for (const s of store.connections) {
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

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape' && open) onClose();
	}}
/>

<aside
	id="connection-panel"
	class="flex flex-col h-full bg-paper text-ink overflow-hidden border-r border-rule
	       fixed inset-y-0 left-0 z-40 w-[min(20rem,85vw)] shadow-xl transition-transform duration-200 ease-out
	       {open ? 'translate-x-0' : '-translate-x-full'}
	       md:static md:translate-x-0 md:w-72 md:shrink-0 md:z-auto md:shadow-none"
	aria-label="Exe Connections Map panel"
>
	<header class="relative shrink-0 px-6 py-3.5 border-b border-rule">
		<h1 class="sr-only">Exe Connections Map</h1>
		<a
			href="/"
			class="flex justify-center rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
			aria-label="River Exe Connections — home"
		>
			<enhanced:img
				src="$lib/assets/river-connections.png"
				alt="River Exe Connections"
				sizes="220px"
				class="h-9 w-auto object-contain"
			/>
		</a>

		<button
			type="button"
			onclick={onClose}
			class="md:hidden absolute top-3 right-3 p-1 rounded-sm text-muted-ink hover:text-ink hover:bg-accent
			       transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
			aria-label="Close panel"
			bind:this={closeButton}
		>
			<X class="w-4 h-4" />
		</button>
	</header>

	<div class="shrink-0 px-6 pt-4 pb-3">
		<button
			type="button"
			onclick={store.openForm}
			disabled={store.mode.type === 'form'}
			class="w-full flex items-center justify-center gap-2 py-2 text-sm font-serif leading-none
			       rounded-sm bg-primary text-primary-foreground shadow-sm
			       hover:opacity-90 transition-opacity
			       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
			       disabled:opacity-40 disabled:cursor-not-allowed"
		>
			<UserPlus class="w-3.5 h-3.5" />
			Add a connection
		</button>
	</div>

	<div class="h-px bg-rule mx-6"></div>

	<div class="flex-1 min-h-0">
		<ScrollArea class="h-full">
			<div class="px-5 py-4">
				{#if store.connections.length === 0}
					<p class="font-serif italic text-sm text-muted-ink pt-2 px-1">
						No connections added yet.
					</p>
				{:else}
					<p class="text-[10px] uppercase tracking-[0.18em] text-muted-ink pb-3 px-1">
						{store.connections.length} {store.connections.length === 1 ? 'connection' : 'connections'}
					</p>

					{#each grouped as [category, connections] (category)}
						{@const isOpen = !closedCategories.has(category)}
						{@const isHidden = store.hiddenCategories.has(category)}
						<div class="mb-3">
							<div class="flex items-center gap-1 py-1">
								<button
									type="button"
									onclick={() => toggleCategorySection(category)}
									class="flex items-center gap-1.5 flex-1 min-w-0 text-left group rounded-sm
									       focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
									aria-expanded={isOpen}
								>
									{#if isOpen}
										<ChevronDown class="w-3 h-3 text-muted-ink/70 shrink-0" />
									{:else}
										<ChevronRight class="w-3 h-3 text-muted-ink/70 shrink-0" />
									{/if}
									<span class="text-[10px] uppercase tracking-[0.18em] transition-colors
									             {isHidden ? 'text-muted-ink/50 line-through' : 'text-muted-ink group-hover:text-ink'}">
										{category}
										<span class="ml-1 {isHidden ? 'text-muted-ink/40' : 'text-muted-ink/60'}">({connections.length})</span>
									</span>
								</button>
								<button
									type="button"
									onclick={() => store.toggleCategoryVisibility(category)}
									class="p-1 rounded-sm transition-colors shrink-0
									       focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
									       {isHidden
										? 'text-muted-ink/40 hover:text-muted-ink'
										: 'text-muted-ink/70 hover:text-ink'}"
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
									{#each connections as connection (connection.id)}
										<ConnectionCard {connection} />
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				{/if}
			</div>
		</ScrollArea>
	</div>

	<footer class="shrink-0 px-6 py-3 border-t border-rule">
		<p class="text-[10px] uppercase tracking-[0.18em] text-muted-ink mb-2">With support from</p>
		<ul class="grid grid-cols-4 gap-1.5">
			<li>
				<a
					href="https://friendsoftheriverexe.org/"
					target="_blank"
					rel="noopener"
					class="h-16 flex items-center justify-center rounded-sm bg-white border border-rule p-1.5 overflow-hidden
					       transition hover:border-ink/25 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					aria-label="Friends of the River Exe (opens in a new tab)"
				>
					<enhanced:img
						src="$lib/assets/friends.png"
						alt="Friends of the River Exe"
						sizes="96px"
						class="max-h-full max-w-full w-auto object-contain"
					/>
				</a>
			</li>
			<li>
				<a
					href="https://www.exeter.ac.uk/"
					target="_blank"
					rel="noopener"
					class="h-16 flex items-center justify-center rounded-sm bg-white border border-rule p-1.5 overflow-hidden
					       transition hover:border-ink/25 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					aria-label="University of Exeter (opens in a new tab)"
				>
					<enhanced:img
						src="$lib/assets/exeter.png"
						alt="University of Exeter"
						sizes="96px"
						class="max-h-full max-w-full w-auto object-contain"
					/>
				</a>
			</li>
			<li>
				<a
					href="https://www.exeter.ac.uk/research/publicengagement/"
					target="_blank"
					rel="noopener"
					class="h-16 flex items-center justify-center rounded-sm bg-white border border-rule p-1.5 overflow-hidden
					       transition hover:border-ink/25 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					aria-label="Public Engagement with Research, University of Exeter (opens in a new tab)"
				>
					<enhanced:img
						src="$lib/assets/public-engagement.png"
						alt="Public Engagement with Research, University of Exeter"
						sizes="96px"
						class="max-h-full max-w-full w-auto object-contain"
					/>
				</a>
			</li>
			<li>
				<a
					href="https://tidelines.uk/"
					target="_blank"
					rel="noopener"
					class="h-16 flex items-center justify-center rounded-sm bg-white border border-rule p-1.5 overflow-hidden
					       transition hover:border-ink/25 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					aria-label="Tidelines (opens in a new tab)"
				>
					<enhanced:img
						src="$lib/assets/tidelineslogo.jpg"
						alt="Tidelines"
						sizes="96px"
						class="max-h-full max-w-full w-auto object-contain"
					/>
				</a>
			</li>
		</ul>
	</footer>
</aside>

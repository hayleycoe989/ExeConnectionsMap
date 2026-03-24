<script lang="ts">
	import { X } from '@lucide/svelte';
	import { store } from '$lib/store.svelte';
	import type { Stakeholder, LsoaClickInfo } from '$lib/types';

	let { info }: { info: LsoaClickInfo } = $props();

	const assignedStakeholders = $derived(
		store.stakeholders.filter((s: Stakeholder) => s.lsoaCodes.includes(info.lsoaCode)),
	);

	const count = $derived(store.lsoaCountMap.get(info.lsoaCode) ?? 0);
</script>

<div class="bg-white border border-slate-200 rounded shadow-md w-52 text-xs overflow-hidden">
	<div class="px-3 py-2.5">
		<div class="flex justify-end mb-1">
			<button
				type="button"
				onclick={() => store.selectLsoa(null)}
				class="p-0.5 text-slate-400 hover:text-slate-600 transition-colors"
				aria-label="Close"
			>
				<X class="w-3.5 h-3.5" />
			</button>
		</div>
		{#if count === 0}
			<p class="text-slate-400 italic font-serif text-[11px]">No stakeholders assigned.</p>
		{:else}
			<p class="text-slate-500 mb-2">
				{count} {count === 1 ? 'stakeholder' : 'stakeholders'}
			</p>
			<ul class="space-y-1.5">
				{#each assignedStakeholders as s (s.id)}
					<li>
						{#if s.link}
							<a
								href={s.link}
								target="_blank"
								rel="noopener"
								class="font-serif text-slate-800 hover:underline underline-offset-2 block"
							>{s.name}</a>
						{:else}
							<p class="font-serif text-slate-800">{s.name}</p>
						{/if}
						<p class="text-slate-500 text-[10px]">{s.role}</p>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

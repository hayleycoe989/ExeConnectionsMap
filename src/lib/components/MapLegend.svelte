<script lang="ts">
	import { CHOROPLETH_COLOURS } from '$lib/mapConfig';

	let open = $state(true);

	const swatches = [
		{ colour: CHOROPLETH_COLOURS.zero, label: 'None' },
		{ colour: CHOROPLETH_COLOURS.one, label: '1' },
		{ colour: CHOROPLETH_COLOURS.two, label: '2–3' },
		{ colour: CHOROPLETH_COLOURS.four, label: '4–5' },
		{ colour: CHOROPLETH_COLOURS.six, label: '6+' },
	];
</script>

<div class="absolute top-3 right-3 z-10">
	<div class="bg-white/95 border border-slate-200 rounded shadow-sm text-xs w-40">
		<button
			type="button"
			onclick={() => (open = !open)}
			class="flex items-center justify-between w-full px-3 py-2 text-left"
			aria-expanded={open}
		>
			<span class="font-serif text-[13px] text-slate-800">Legend</span>
			<span class="text-slate-400 text-[10px]">{open ? '▲' : '▼'}</span>
		</button>

		{#if open}
			<div class="px-3 pb-3 border-t border-slate-100 space-y-3">
				<div class="pt-2 space-y-1.5">
					<p class="font-serif text-[11px] text-slate-500 italic">Stakeholders per LSOA</p>
					{#each swatches as { colour, label }}
						<div class="flex items-center gap-2">
							<span
								class="w-4 h-3 rounded-sm border border-slate-200 shrink-0"
								style:background-color={colour}
							></span>
							<span class="text-slate-700">{label}</span>
						</div>
					{/each}
				</div>
				</div>
			</div>
		{/if}
	</div>
</div>

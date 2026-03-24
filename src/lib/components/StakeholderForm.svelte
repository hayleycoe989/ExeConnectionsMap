<script lang="ts">
	import { X, TriangleAlert, LoaderCircle } from '@lucide/svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';

	import { store } from '$lib/store.svelte';
	import { scale, fade } from 'svelte/transition';
	import { tick } from 'svelte';
	import { z } from 'zod';
	import { STAKEHOLDER_CATEGORIES, type StakeholderCategory } from '$lib/types';

	const schema = z.object({
		name: z.string().min(1, 'Name or organisation is required').max(200),
		role: z.string().min(1, 'Role is required').max(150),
		link: z.string().max(500).optional(),
	});

	let formData = $state({ name: '', role: '', link: '' });
	let selectedCategories = $state<StakeholderCategory[]>([]);
	let disclaimerAccepted = $state(false);
	let errors = $state<{ name?: string; role?: string; link?: string; categories?: string; disclaimer?: string }>({});
	let isSubmitting = $state(false);
	let disclaimerRef = $state<HTMLDivElement | undefined>();

	$effect(() => {
		if (store.mode.type === 'form') {
			formData = { name: '', role: '', link: '' };
			selectedCategories = [];
			disclaimerAccepted = false;
			errors = {};
			isSubmitting = false;
		}
	});

	function toggleCategory(cat: StakeholderCategory) {
		if (selectedCategories.includes(cat)) {
			selectedCategories = selectedCategories.filter((c) => c !== cat);
		} else {
			selectedCategories = [...selectedCategories, cat];
		}
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();

		if (!disclaimerAccepted) {
			errors = { ...errors, disclaimer: 'You must accept the disclaimer to continue.' };
			await tick();
			disclaimerRef?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			return;
		}

		const result = schema.safeParse(formData);
		if (!result.success) {
			const flat = z.flattenError(result.error).fieldErrors;
			errors = {
				name: flat.name?.[0],
				role: flat.role?.[0],
				link: flat.link?.[0],
			};
			return;
		}

		// Validate URL if provided
		const linkVal = formData.link.trim();
		if (linkVal) {
			try {
				new URL(linkVal.startsWith('http') ? linkVal : `https://${linkVal}`);
			} catch {
				errors = { ...errors, link: 'Please enter a valid URL.' };
				return;
			}
		}

		if (selectedCategories.length === 0) {
			errors = { ...errors, categories: 'Select at least one category.' };
			return;
		}

		isSubmitting = true;
		errors = {};
		await store.submitStakeholder({
			...result.data,
			link: linkVal,
			categories: selectedCategories,
			disclaimerAccepted,
		});
		isSubmitting = false;
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') store.closeForm();
	}}
/>

<div
	class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
	role="dialog"
	aria-modal="true"
	aria-labelledby="form-title"
	transition:fade={{ duration: 150 }}
>
	<div
		class="w-full max-w-sm bg-white border border-slate-200 shadow-xl rounded-lg overflow-hidden flex flex-col max-h-[92vh]"
		transition:scale={{ start: 0.97, duration: 150 }}
	>
		<!-- Header -->
		<div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
			<h2 id="form-title" class="font-serif text-base text-slate-800">
				Add stakeholder
			</h2>
			<button
				type="button"
				onclick={store.closeForm}
				class="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
				aria-label="Close"
			>
				<X class="w-4 h-4" />
			</button>
		</div>

		<!-- Body -->
		<form
			id="stakeholder-form"
			onsubmit={handleSubmit}
			class="flex-1 overflow-y-auto px-5 py-5 space-y-4"
			novalidate
		>
			<!-- Disclaimer -->
			<div
				bind:this={disclaimerRef}
				class="p-3 border border-amber-200 rounded bg-amber-50"
			>
				<div class="flex gap-2.5">
					<TriangleAlert class="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
					<p class="text-xs leading-relaxed text-amber-800">
						Data you enter is stored on a University of Exeter server and may be accessed by the
						research team. Do not enter sensitive personal information.
					</p>
				</div>
				<div class="flex items-center gap-2 mt-3 pt-3 border-t border-amber-200">
					<Checkbox
						id="disclaimer"
						bind:checked={disclaimerAccepted}
						class="border-amber-400 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
					/>
					<Label for="disclaimer" class="text-xs text-amber-800 cursor-pointer leading-relaxed">
						I understand and wish to proceed
					</Label>
				</div>
				{#if errors.disclaimer}
					<p class="text-[10px] text-red-600 mt-1">{errors.disclaimer}</p>
				{/if}
			</div>

			<div class="space-y-1.5">
				<label for="s-name" class="block font-serif text-xs text-slate-600">Name or organisation</label>
				<Input
					id="s-name"
					type="text"
					autocomplete="off"
					bind:value={formData.name}
					placeholder="e.g. Jane Smith, Devon Wildlife Trust"
					class={errors.name ? 'border-red-400' : ''}
				/>
				{#if errors.name}
					<p class="text-[10px] text-red-600">{errors.name}</p>
				{/if}
			</div>

			<div class="space-y-1.5">
				<label for="s-role" class="block font-serif text-xs text-slate-600">Role or interest</label>
				<Textarea
					id="s-role"
					bind:value={formData.role}
					rows={2}
					placeholder="e.g. Environmental officer, local resident, researcher…"
					class={`resize-none${errors.role ? ' border-red-400' : ''}`}
				/>
				{#if errors.role}
					<p class="text-[10px] text-red-600">{errors.role}</p>
				{/if}
			</div>

			<div class="space-y-1.5">
				<label for="s-link" class="block font-serif text-xs text-slate-600">
					Website <span class="font-sans text-slate-400">(optional)</span>
				</label>
				<Input
					id="s-link"
					type="url"
					autocomplete="off"
					bind:value={formData.link}
					placeholder="https://example.org"
					class={errors.link ? 'border-red-400' : ''}
				/>
				{#if errors.link}
					<p class="text-[10px] text-red-600">{errors.link}</p>
				{/if}
			</div>

			<!-- Categories -->
			<div class="space-y-1.5">
				<p class="font-serif text-xs text-slate-600">Interest categories</p>
				<div class="flex flex-wrap gap-1.5">
					{#each STAKEHOLDER_CATEGORIES as cat}
						{@const active = selectedCategories.includes(cat)}
						<button
							type="button"
							onclick={() => toggleCategory(cat)}
							class="px-2.5 py-1 rounded text-[11px] border transition-colors
							       {active
								? 'bg-slate-800 text-white border-slate-800'
								: 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}"
						>
							{cat}
						</button>
					{/each}
				</div>
				{#if errors.categories}
					<p class="text-[10px] text-red-600">{errors.categories}</p>
				{/if}
			</div>
		</form>

		<!-- Footer -->
		<div class="flex gap-2 px-5 py-4 border-t border-slate-100">
			<button
				type="button"
				onclick={store.closeForm}
				class="flex-1 py-2 text-sm font-serif border border-slate-200 rounded text-slate-600
				       hover:bg-slate-50 transition-colors disabled:opacity-40"
				disabled={isSubmitting}
			>
				Cancel
			</button>
			<button
				type="submit"
				form="stakeholder-form"
				class="flex-1 py-2 text-sm font-serif rounded bg-slate-800 text-white
				       hover:bg-slate-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
				disabled={isSubmitting}
			>
				{#if isSubmitting}
					<LoaderCircle class="w-3.5 h-3.5 animate-spin" />
				{/if}
				Add stakeholder
			</button>
		</div>
	</div>
</div>

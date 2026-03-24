import type { AppMode, LsoaClickInfo, Stakeholder, StakeholderFormData } from '$lib/types';

function createStore() {
	let stakeholders = $state<Stakeholder[]>([]);
	let mode = $state<AppMode>({ type: 'idle' });
	let selectedLsoa = $state<LsoaClickInfo | null>(null);
	let hiddenCategories = $state(new Set<string>());

	const lsoaCountMap = $derived(
		stakeholders
			.filter((s) => !hiddenCategories.has(s.categories[0] ?? 'Uncategorised'))
			.flatMap((s) => s.lsoaCodes)
			.reduce((acc, code) => {
				acc.set(code, (acc.get(code) ?? 0) + 1);
				return acc;
			}, new Map<string, number>()),
	);

	function toggleCategoryVisibility(category: string) {
		const next = new Set(hiddenCategories);
		if (next.has(category)) {
			next.delete(category);
		} else {
			next.add(category);
		}
		hiddenCategories = next;
	}

	async function loadFromServer() {
		try {
			const res = await fetch('/api/stakeholders');
			if (res.ok) stakeholders = (await res.json()) as Stakeholder[];
		} catch {
			// Silently start with empty list
		}
	}

	function openForm() {
		selectedLsoa = null;
		mode = { type: 'form' };
	}

	function closeForm() {
		mode = { type: 'idle' };
	}

	async function submitStakeholder(data: StakeholderFormData): Promise<string> {
		const id = crypto.randomUUID();
		const trimmedLink = data.link.trim();
		const newStakeholder: Stakeholder = {
			id,
			name: data.name.trim(),
			role: data.role.trim(),
			link: trimmedLink || undefined,
			categories: data.categories,
			lsoaCodes: [],
			createdAt: new Date().toISOString(),
		};
		stakeholders = [...stakeholders, newStakeholder];
		await fetch('/api/stakeholders', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(newStakeholder),
		});
		mode = { type: 'lsoa-selection', stakeholderId: id };
		return id;
	}

	function enterSelectionMode(stakeholderId: string) {
		selectedLsoa = null;
		mode = { type: 'lsoa-selection', stakeholderId };
	}

	function finishSelectionMode() {
		mode = { type: 'idle' };
	}

	function toggleLsoaAssignment(stakeholderId: string, lsoaCode: string) {
		stakeholders = stakeholders.map((s) => {
			if (s.id !== stakeholderId) return s;
			const has = s.lsoaCodes.includes(lsoaCode);
			return {
				...s,
				lsoaCodes: has
					? s.lsoaCodes.filter((c) => c !== lsoaCode)
					: [...s.lsoaCodes, lsoaCode],
			};
		});
		const updated = stakeholders.find((s) => s.id === stakeholderId);
		if (updated) {
			fetch(`/api/stakeholders/${stakeholderId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ lsoaCodes: updated.lsoaCodes }),
			}).catch(() => {});
		}
	}

	function isLsoaAssigned(stakeholderId: string, lsoaCode: string): boolean {
		return stakeholders.find((s) => s.id === stakeholderId)?.lsoaCodes.includes(lsoaCode) ?? false;
	}

	function deleteStakeholder(id: string) {
		stakeholders = stakeholders.filter((s) => s.id !== id);
		fetch(`/api/stakeholders/${id}`, { method: 'DELETE' }).catch(() => {});
		if (mode.type === 'lsoa-selection' && mode.stakeholderId === id) {
			mode = { type: 'idle' };
		}
	}

	function selectLsoa(info: LsoaClickInfo | null) {
		selectedLsoa = info;
	}

	return {
		get stakeholders() {
			return stakeholders;
		},
		get mode() {
			return mode;
		},
		get selectedLsoa() {
			return selectedLsoa;
		},
		get lsoaCountMap() {
			return lsoaCountMap;
		},
		get hiddenCategories() {
			return hiddenCategories;
		},
		loadFromServer,
		toggleCategoryVisibility,
		openForm,
		closeForm,
		submitStakeholder,
		enterSelectionMode,
		finishSelectionMode,
		toggleLsoaAssignment,
		isLsoaAssigned,
		deleteStakeholder,
		selectLsoa,
	};
}

export const store = createStore();

import type { AppMode, StakeholderClickInfo, Stakeholder, StakeholderFormData } from '$lib/types';
import type { Polygon } from 'geojson';

function createStore() {
	let stakeholders = $state<Stakeholder[]>([]);
	let mode = $state<AppMode>({ type: 'idle' });
	let selectedStakeholder = $state<StakeholderClickInfo | null>(null);
	let hiddenCategories = $state(new Set<string>());

	function toggleCategoryVisibility(category: string) {
		const next = new Set(hiddenCategories);
		if (next.has(category)) {
			next.delete(category);
		} else {
			next.add(category);
		}
		hiddenCategories = next;
	}

	function init(initial: Stakeholder[]) {
		stakeholders = initial;
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
		selectedStakeholder = null;
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
			area: null,
			createdAt: new Date().toISOString(),
		};
		stakeholders = [...stakeholders, newStakeholder];
		await fetch('/api/stakeholders', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(newStakeholder),
		});
		mode = { type: 'draw', stakeholderId: id };
		return id;
	}

	function enterDrawMode(stakeholderId: string) {
		selectedStakeholder = null;
		mode = { type: 'draw', stakeholderId };
	}

	function finishDrawMode() {
		mode = { type: 'idle' };
	}

	function setStakeholderArea(stakeholderId: string, area: Polygon | null) {
		stakeholders = stakeholders.map((s) =>
			s.id === stakeholderId ? { ...s, area } : s,
		);
		fetch(`/api/stakeholders/${stakeholderId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ area }),
		}).catch(() => {});
	}

	function deleteStakeholder(id: string) {
		stakeholders = stakeholders.filter((s) => s.id !== id);
		fetch(`/api/stakeholders/${id}`, { method: 'DELETE' }).catch(() => {});
		if (mode.type === 'draw' && mode.stakeholderId === id) {
			mode = { type: 'idle' };
		}
		if (selectedStakeholder?.stakeholderId === id) {
			selectedStakeholder = null;
		}
	}

	function selectStakeholder(info: StakeholderClickInfo | null) {
		selectedStakeholder = info;
	}

	return {
		get stakeholders() {
			return stakeholders;
		},
		init,
		get mode() {
			return mode;
		},
		get selectedStakeholder() {
			return selectedStakeholder;
		},
		get hiddenCategories() {
			return hiddenCategories;
		},
		loadFromServer,
		toggleCategoryVisibility,
		openForm,
		closeForm,
		submitStakeholder,
		enterDrawMode,
		finishDrawMode,
		setStakeholderArea,
		deleteStakeholder,
		selectStakeholder,
	};
}

export const store = createStore();

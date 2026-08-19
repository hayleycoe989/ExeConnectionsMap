import type { AppMode, ConnectionClickInfo, Connection, ConnectionFormData } from '$lib/types';
import type { Polygon } from 'geojson';
import { CATEGORY_LAYERS } from '$lib/mapConfig';

const ALL_LAYER_IDS = Object.values(CATEGORY_LAYERS)
	.flat()
	.map((layer) => layer.id);

function createStore() {
	let connections = $state<Connection[]>([]);
	let mode = $state<AppMode>({ type: 'idle' });
	let selectedConnection = $state<ConnectionClickInfo | null>(null);
	let hiddenCategories = $state(new Set<string>());
	let hiddenLayers = $state(new Set<string>(ALL_LAYER_IDS));
	let popup = $state<any | null>(null);


	function toggleCategoryVisibility(category: string) {
		const next = new Set(hiddenCategories);
		if (next.has(category)) {
			next.delete(category);
		} else {
			next.add(category);
		}
		hiddenCategories = next;
	}

	function toggleLayerVisibility(layer: string) {
		const next = new Set(hiddenLayers);
		if (next.has(layer)) {
			next.delete(layer);
		} else {
			next.add(layer);
		}
		hiddenLayers = next;
	}

	function init(initial: Connection[]) {
		connections = Array.isArray(initial) ? initial : [];
	}

	async function loadFromServer() {
		try {
			const res = await fetch('/api/connections');
			if (res.ok) connections = (await res.json()) as Connection[];
		} catch {}
	}

	function openForm() {
		selectedConnection = null;
		mode = { type: 'form' };
	}

	function closeForm() {
		mode = { type: 'idle' };
	}

	async function submitConnection(data: ConnectionFormData): Promise<string> {
		const id = crypto.randomUUID();
		const trimmedLink = data.link.trim();
		const newConnection: Connection = {
			id,
			name: data.name.trim(),
			role: data.role.trim(),
			link: trimmedLink || undefined,
			categories: data.categories,
			area: null,
			createdAt: new Date().toISOString(),
		};
		connections = [...connections, newConnection];
		await fetch('/api/connections', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(newConnection),
		});
		popup = null;
		mode = { type: 'draw', connectionId: id };
		return id;
	}

	function enterDrawMode(connectionId: string) {
		selectedConnection = null;
		popup = null;
		mode = { type: 'draw', connectionId };
	}

	function finishDrawMode() {
		mode = { type: 'idle' };
	}

	function setConnectionArea(connectionId: string, area: Polygon | null) {
		connections = connections.map((s) =>
			s.id === connectionId ? { ...s, area } : s,
		);
		fetch(`/api/connections/${connectionId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ area }),
		}).catch(() => {});
	}

	function deleteConnection(id: string) {
		connections = connections.filter((s) => s.id !== id);
		fetch(`/api/connections/${id}`, { method: 'DELETE' }).catch(() => {});
		if (mode.type === 'draw' && mode.connectionId === id) {
			mode = { type: 'idle' };
		}
		if (selectedConnection?.connectionId === id) {
			selectedConnection = null;
		}
	}

	function selectConnection(info: ConnectionClickInfo | null) {
		selectedConnection = info;
	}

	function setPopup(info: any | null) {
  		popup = info;
	}

	return {
    get popup() {
        return popup;
    },
    setPopup,
    get connections() {
        return connections;
    },
    init,
    get mode() {
        return mode;
    },
    get selectedConnection() {
        return selectedConnection;
    },
    get hiddenCategories() {
        return hiddenCategories;
    },
    get hiddenLayers() {
        return hiddenLayers;
    },

    loadFromServer,
    toggleCategoryVisibility,
    toggleLayerVisibility,
    openForm,
    closeForm,
    submitConnection,
    enterDrawMode,
    finishDrawMode,
    setConnectionArea,
    deleteConnection,
    selectConnection
};

}

export const store = createStore();

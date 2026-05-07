<script lang="ts">
	import { onMount } from 'svelte';
	import type { Map as MapType } from 'maplibre-gl';
	import MapboxDraw from '@mapbox/mapbox-gl-draw';
	import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
	import type { Feature, Polygon } from 'geojson';
	import { store } from '$lib/store.svelte';
	import { defaultDrawOptions } from '$lib/drawConfig';

	// MapLibre compatibility shim — mapbox-gl-draw assumes mapboxgl-* class names,
	// MapLibre uses maplibregl-*. Patching the constants once before instantiation
	// makes the control discoverable by MapLibre's CSS. The cast bypasses the
	// upstream type's string-literal narrowing.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const drawClasses = MapboxDraw.constants.classes as any;
	drawClasses.CONTROL_BASE = 'maplibregl-ctrl';
	drawClasses.CONTROL_PREFIX = 'maplibregl-ctrl-';
	drawClasses.CONTROL_GROUP = 'maplibregl-ctrl-group';
	drawClasses.ATTRIBUTION = 'maplibregl-ctrl-attrib';

	let { map }: { map: MapType } = $props();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let draw: any;

	function activeStakeholderId(): string | null {
		return store.mode.type === 'draw' ? store.mode.stakeholderId : null;
	}

	function onCreate(e: { features: Feature[] }) {
		const id = activeStakeholderId();
		if (!id) return;
		const polygon = e.features[0]?.geometry as Polygon | undefined;
		if (!polygon || polygon.type !== 'Polygon') return;

		// Single-polygon constraint: if multiple features end up in the buffer
		// (shouldn't happen via UI, but guard anyway), keep the latest only.
		const all = draw.getAll();
		if (all.features.length > 1) {
			const latestId = e.features[0].id;
			for (const f of all.features) {
				if (f.id !== latestId) draw.delete(f.id as string);
			}
		}

		store.setStakeholderArea(id, polygon);
	}

	function onUpdate(e: { features: Feature[] }) {
		const id = activeStakeholderId();
		if (!id) return;
		const polygon = e.features[0]?.geometry as Polygon | undefined;
		if (!polygon || polygon.type !== 'Polygon') return;
		store.setStakeholderArea(id, polygon);
	}

	function onDelete() {
		const id = activeStakeholderId();
		if (!id) return;
		store.setStakeholderArea(id, null);
	}

	onMount(() => {
		draw = new MapboxDraw(defaultDrawOptions);
		// MapLibre's Map shape is structurally compatible with Mapbox's IControl host.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		map.addControl(draw as any, 'top-left');
		map.on('draw.create', onCreate);
		map.on('draw.update', onUpdate);
		map.on('draw.delete', onDelete);

		return () => {
			map.off('draw.create', onCreate);
			map.off('draw.update', onUpdate);
			map.off('draw.delete', onDelete);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			map.removeControl(draw as any);
		};
	});

	// Sync draw control state with store.mode.
	$effect(() => {
		if (!draw) return;
		const mode = store.mode;
		if (mode.type !== 'draw') {
			draw.deleteAll();
			draw.changeMode('simple_select');
			return;
		}
		const stakeholder = store.stakeholders.find((s) => s.id === mode.stakeholderId);
		if (!stakeholder) return;

		if (stakeholder.area) {
			const featureId = `area-${stakeholder.id}`;
			draw.set({
				type: 'FeatureCollection',
				features: [
					{
						id: featureId,
						type: 'Feature',
						geometry: stakeholder.area,
						properties: {},
					},
				],
			});
			// direct_select exposes per-vertex handles + midpoints for adding new
			// vertices. simple_select would only let the user move the whole polygon.
			draw.changeMode('direct_select', { featureId });
		} else {
			draw.deleteAll();
			draw.changeMode('draw_polygon');
		}
	});
</script>

<style>
	/* The hidden mapbox-gl-draw control — banner buttons drive mode changes,
	   not the default polygon/trash buttons. We only addControl so the layers
	   wire up correctly via map.addControl's IControl lifecycle. */
	:global(.maplibregl-ctrl-group:has(.mapbox-gl-draw_ctrl-draw-btn)) {
		display: none;
	}
</style>

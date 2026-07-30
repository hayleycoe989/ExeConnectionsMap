<script lang="ts">
	import { onMount } from 'svelte';
	import type { Map as MapType } from 'maplibre-gl';
	import MapboxDraw from '@mapbox/mapbox-gl-draw';
	import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
	import type { Feature, Polygon } from 'geojson';
	import { store } from '$lib/store.svelte';
	import { defaultDrawOptions } from '$lib/drawConfig';

	const drawClasses = MapboxDraw.constants.classes as any;
	drawClasses.CONTROL_BASE = 'maplibregl-ctrl';
	drawClasses.CONTROL_PREFIX = 'maplibregl-ctrl-';
	drawClasses.CONTROL_GROUP = 'maplibregl-ctrl-group';
	drawClasses.ATTRIBUTION = 'maplibregl-ctrl-attrib';

	let { map }: { map: MapType } = $props();

	let draw: any;

	function activeConnectionId(): string | null {
		return store.mode.type === 'draw' ? store.mode.connectionId : null;
	}

	function onCreate(e: { features: Feature[] }) {
		const id = activeConnectionId();
		if (!id) return;
		const polygon = e.features[0]?.geometry as Polygon | undefined;
		if (!polygon || polygon.type !== 'Polygon') return;

		const all = draw.getAll();
		if (all.features.length > 1) {
			const latestId = e.features[0].id;
			for (const f of all.features) {
				if (f.id !== latestId) draw.delete(f.id as string);
			}
		}

		store.setConnectionArea(id, polygon);
	}

	function onUpdate(e: { features: Feature[] }) {
		const id = activeConnectionId();
		if (!id) return;
		const polygon = e.features[0]?.geometry as Polygon | undefined;
		if (!polygon || polygon.type !== 'Polygon') return;
		store.setConnectionArea(id, polygon);
	}

	function onDelete() {
		const id = activeConnectionId();
		if (!id) return;
		store.setConnectionArea(id, null);
	}

	onMount(() => {
		draw = new MapboxDraw(defaultDrawOptions);
		map.addControl(draw as any, 'top-left');
		map.on('draw.create', onCreate);
		map.on('draw.update', onUpdate);
		map.on('draw.delete', onDelete);

		return () => {
			map.off('draw.create', onCreate);
			map.off('draw.update', onUpdate);
			map.off('draw.delete', onDelete);
			map.removeControl(draw as any);
		};
	});

	$effect(() => {
		if (!draw) return;
		const mode = store.mode;
		if (mode.type !== 'draw') {
			draw.deleteAll();
			draw.changeMode('simple_select');
			return;
		}
		const connection = store.connections.find((s) => s.id === mode.connectionId);
		if (!connection) return;

		if (connection.area) {
			const featureId = `area-${connection.id}`;
			draw.set({
				type: 'FeatureCollection',
				features: [
					{
						id: featureId,
						type: 'Feature',
						geometry: connection.area,
						properties: {},
					},
				],
			});
			draw.changeMode('direct_select', { featureId });
		} else {
			draw.deleteAll();
			draw.changeMode('draw_polygon');
		}
	});
</script>

<style>
	:global(.maplibregl-ctrl-group:has(.mapbox-gl-draw_ctrl-draw-btn)) {
		display: none;
	}

	:global(.maplibregl-map.mouse-pointer .maplibregl-canvas-container.maplibregl-interactive) {
		cursor: pointer;
	}
	:global(.maplibregl-map.mouse-add .maplibregl-canvas-container.maplibregl-interactive) {
		cursor: crosshair;
	}
	:global(.maplibregl-map.mouse-move .maplibregl-canvas-container.maplibregl-interactive) {
		cursor: move;
	}
	:global(
		.maplibregl-map.mode-direct_select.mouse-move
			.maplibregl-canvas-container.maplibregl-interactive
	) {
		cursor: grab;
	}
	:global(
		.maplibregl-map.mode-direct_select.feature-vertex.mouse-move
			.maplibregl-canvas-container.maplibregl-interactive
	) {
		cursor: move;
	}
	:global(
		.maplibregl-map.mode-direct_select.feature-midpoint.mouse-pointer
			.maplibregl-canvas-container.maplibregl-interactive
	) {
		cursor: cell;
	}
	:global(
		.maplibregl-map.mode-direct_select.feature-feature.mouse-move
			.maplibregl-canvas-container.maplibregl-interactive
	) {
		cursor: move;
	}
	:global(
		.maplibregl-map.mode-simple_select.feature-feature.mouse-move
			.maplibregl-canvas-container.maplibregl-interactive
	) {
		cursor: move;
	}
</style>

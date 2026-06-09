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

	function activeConnectionId(): string | null {
		return store.mode.type === 'draw' ? store.mode.connectionId : null;
	}

	function onCreate(e: { features: Feature[] }) {
		const id = activeConnectionId();
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

	/* mapbox-gl-draw applies mouse-/mode-/feature- classes to the map container,
	   but its bundled CSS only targets .mapboxgl-* selectors. Mirror the
	   contextual cursors against MapLibre's class names. */
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
	/* Hovering a vertex while in direct_select — the resize / move arrows. */
	:global(
		.maplibregl-map.mode-direct_select.feature-vertex.mouse-move
			.maplibregl-canvas-container.maplibregl-interactive
	) {
		cursor: move;
	}
	/* Hovering a midpoint — clicking it inserts a new vertex. */
	:global(
		.maplibregl-map.mode-direct_select.feature-midpoint.mouse-pointer
			.maplibregl-canvas-container.maplibregl-interactive
	) {
		cursor: cell;
	}
	/* Hovering the polygon body in direct_select — drag to translate the whole
	   shape. */
	:global(
		.maplibregl-map.mode-direct_select.feature-feature.mouse-move
			.maplibregl-canvas-container.maplibregl-interactive
	) {
		cursor: move;
	}
	/* simple_select — hovering the polygon body, ready to grab. */
	:global(
		.maplibregl-map.mode-simple_select.feature-feature.mouse-move
			.maplibregl-canvas-container.maplibregl-interactive
	) {
		cursor: move;
	}
</style>

<script lang="ts">
	import {
		MapLibre,
		NavigationControl,
		GeoJSONSource,
		FillLayer,
		LineLayer,
	} from 'svelte-maplibre-gl';
	import type { Map as MapType, MapLayerMouseEvent, StyleSpecification } from 'maplibre-gl';
	import type { Feature, FeatureCollection, Polygon } from 'geojson';
	import { PMTilesProtocol } from '@svelte-maplibre-gl/pmtiles';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { onMount, tick } from 'svelte';
	import { browser } from '$app/environment';
	import { store } from '$lib/store.svelte';
	import {
		MAP_CONFIG,
		BASEMAP_URL,
		CONNECTION_FILL_PAINT,
		CONNECTION_LINE_PAINT,
	} from '$lib/mapConfig';
	import type { Component } from 'svelte';
	import MapPopup from './MapPopup.svelte';
	import ConnectionPopup from './ConnectionPopup.svelte';
	import SelectionBanner from './SelectionBanner.svelte';
	import MapLegend from './MapLegend.svelte';

	let map = $state<MapType | undefined>();
	let protocolReady = $state(false);
	let mapStyle = $state<StyleSpecification | undefined>();

	onMount(async () => {
		await tick();
		protocolReady = true;
		const res = await fetch('/style.json');
		const style = await res.json();
		// Replace the hardcoded demo-bucket URL with the env-configured basemap URL.
		style.sources.protomaps.url = BASEMAP_URL;
		mapStyle = style;
	});

	// Defer @mapbox/mapbox-gl-draw — it's only needed while editing an area, so it
	// stays out of the initial map chunk. Loaded on first draw, and prefetched on
	// idle once the map is ready so the first edit has no perceptible delay.
	let DrawControl = $state<Component<{ map: MapType }> | null>(null);
	let drawRequested = false;
	function loadDrawControl() {
		if (DrawControl || drawRequested) return;
		drawRequested = true;
		import('./MapDrawControl.svelte').then((m) => (DrawControl = m.default));
	}
	$effect(() => {
		if (store.mode.type === 'draw') loadDrawControl();
	});
	$effect(() => {
		if (!map) return;
		const w = window as unknown as {
			requestIdleCallback?: (cb: () => void) => number;
			cancelIdleCallback?: (id: number) => void;
		};
		const schedule = w.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
		const id = schedule(loadDrawControl);
		return () => (w.cancelIdleCallback ? w.cancelIdleCallback(id) : clearTimeout(id));
	});

	// dragPan stays enabled in every mode — mapbox-gl-draw's own pointer handlers
	// take precedence over its features (vertices, midpoints, polygon body) while
	// still letting the user pan between edits. The canvas cursor is left to
	// mapbox-gl-draw, which sets contextual cursors per mode (crosshair while
	// drawing, move/grab on vertex handles, etc.).

	// Read-only connection polygon layer source — derived from the store.
	// Excludes the actively-edited connection (mapbox-gl-draw owns its geometry)
	// and any connections whose category is hidden.
	const connectionFeatures = $derived.by<FeatureCollection>(() => {
		const activeId = store.mode.type === 'draw' ? store.mode.connectionId : null;
		const features: Feature[] = [];
		for (const s of store.connections) {
			if (!s.area) continue;
			if (s.id === activeId) continue;
			const category = s.categories[0] ?? 'Uncategorised';
			if (store.hiddenCategories.has(category)) continue;
			features.push({
				type: 'Feature',
				id: s.id,
				geometry: s.area as Polygon,
				properties: {
					id: s.id,
					name: s.name,
					category,
				},
			});
		}
		return { type: 'FeatureCollection', features };
	});

	let hoveredId = $state<string | null>(null);

	function handlePolygonClick(e: MapLayerMouseEvent) {
		if (store.mode.type !== 'idle') return;
		const props = e.features?.[0]?.properties as { id?: string } | undefined;
		const id = props?.id;
		if (!id) return;
		store.selectConnection({ connectionId: id, lngLat: [e.lngLat.lng, e.lngLat.lat] });
		e.originalEvent.stopPropagation();
	}

	function handlePolygonEnter(e: MapLayerMouseEvent) {
		if (!map) return;
		if (store.mode.type === 'draw') return;
		const id = (e.features?.[0]?.properties as { id?: string } | undefined)?.id;
		if (!id) return;
		if (hoveredId && hoveredId !== id) {
			map.setFeatureState({ source: 'connections', id: hoveredId }, { hovered: false });
		}
		hoveredId = id;
		map.setFeatureState({ source: 'connections', id }, { hovered: true });
		map.getCanvas().style.cursor = 'pointer';
	}

	function handlePolygonLeave() {
		if (!map) return;
		if (hoveredId) {
			map.setFeatureState({ source: 'connections', id: hoveredId }, { hovered: false });
			hoveredId = null;
		}
		if (store.mode.type !== 'draw') {
			map.getCanvas().style.cursor = '';
		}
	}

	function handleMapClick() {
		if (store.mode.type === 'idle') {
			store.selectConnection(null);
		}
	}
</script>

{#if browser}
	<div class="relative w-full h-full overflow-hidden">
		<PMTilesProtocol />
		{#if !mapStyle}
			<div class="absolute inset-0 flex items-center justify-center bg-background">
				<div class="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
			</div>
		{/if}
		{#if mapStyle}
			<MapLibre
				bind:map
				class="w-full h-full"
				{...MAP_CONFIG}
				attributionControl={false}
				style={mapStyle}
				onclick={handleMapClick}
			>
				<NavigationControl position="bottom-right" />

				<SelectionBanner />
				<MapLegend />

				{#if map && DrawControl}
					{@const DC = DrawControl}
					<DC {map} />
				{/if}

				<!-- Connection polygon overlays (read-only). -->
				<GeoJSONSource id="connections" data={connectionFeatures} promoteId="id">
					<FillLayer
						id="connections-fill"
						paint={CONNECTION_FILL_PAINT}
						onclick={handlePolygonClick}
						onmousemove={handlePolygonEnter}
						onmouseleave={handlePolygonLeave}
					/>
					<LineLayer id="connections-line" paint={CONNECTION_LINE_PAINT} />
				</GeoJSONSource>

				<!-- Attribution -->
				<div
					class="absolute bottom-1 left-1 z-10 text-[9px] text-muted-ink bg-paper/90 border border-rule
					       px-1.5 py-0.5 rounded-sm pointer-events-none"
				>
					© <a href="https://openstreetmap.org" class="pointer-events-auto underline-offset-1 hover:underline" target="_blank" rel="noopener">OpenStreetMap</a>
					· <a href="https://protomaps.com" class="pointer-events-auto underline-offset-1 hover:underline" target="_blank" rel="noopener">Protomaps</a>
					· ONS Open Geography
				</div>

				{#if store.selectedConnection && store.mode.type === 'idle'}
					<MapPopup
						lnglat={store.selectedConnection.lngLat}
						onclose={() => store.selectConnection(null)}
						component={ConnectionPopup}
						props={{ connectionId: store.selectedConnection.connectionId }}
					/>
				{/if}
			</MapLibre>
		{/if}
	</div>
{/if}

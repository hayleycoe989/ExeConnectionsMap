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
		STAKEHOLDER_FILL_PAINT,
		STAKEHOLDER_LINE_PAINT,
	} from '$lib/mapConfig';
	import MapPopup from './MapPopup.svelte';
	import StakeholderPopup from './StakeholderPopup.svelte';
	import SelectionBanner from './SelectionBanner.svelte';
	import MapLegend from './MapLegend.svelte';
	import MapDrawControl from './MapDrawControl.svelte';

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

	// dragPan stays enabled in every mode — mapbox-gl-draw's own pointer handlers
	// take precedence over its features (vertices, midpoints, polygon body) while
	// still letting the user pan between edits. The canvas cursor is left to
	// mapbox-gl-draw, which sets contextual cursors per mode (crosshair while
	// drawing, move/grab on vertex handles, etc.).

	// Read-only stakeholder polygon layer source — derived from the store.
	// Excludes the actively-edited stakeholder (mapbox-gl-draw owns its geometry)
	// and any stakeholders whose category is hidden.
	const stakeholderFeatures = $derived.by<FeatureCollection>(() => {
		const activeId = store.mode.type === 'draw' ? store.mode.stakeholderId : null;
		const features: Feature[] = [];
		for (const s of store.stakeholders) {
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
		store.selectStakeholder({ stakeholderId: id, lngLat: [e.lngLat.lng, e.lngLat.lat] });
		e.originalEvent.stopPropagation();
	}

	function handlePolygonEnter(e: MapLayerMouseEvent) {
		if (!map) return;
		if (store.mode.type === 'draw') return;
		const id = (e.features?.[0]?.properties as { id?: string } | undefined)?.id;
		if (!id) return;
		if (hoveredId && hoveredId !== id) {
			map.setFeatureState({ source: 'stakeholders', id: hoveredId }, { hovered: false });
		}
		hoveredId = id;
		map.setFeatureState({ source: 'stakeholders', id }, { hovered: true });
		map.getCanvas().style.cursor = 'pointer';
	}

	function handlePolygonLeave() {
		if (!map) return;
		if (hoveredId) {
			map.setFeatureState({ source: 'stakeholders', id: hoveredId }, { hovered: false });
			hoveredId = null;
		}
		if (store.mode.type !== 'draw') {
			map.getCanvas().style.cursor = '';
		}
	}

	function handleMapClick() {
		if (store.mode.type === 'idle') {
			store.selectStakeholder(null);
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

				{#if map}
					<MapDrawControl {map} />
				{/if}

				<!-- Stakeholder polygon overlays (read-only). -->
				<GeoJSONSource id="stakeholders" data={stakeholderFeatures} promoteId="id">
					<FillLayer
						id="stakeholders-fill"
						paint={STAKEHOLDER_FILL_PAINT}
						onclick={handlePolygonClick}
						onmousemove={handlePolygonEnter}
						onmouseleave={handlePolygonLeave}
					/>
					<LineLayer id="stakeholders-line" paint={STAKEHOLDER_LINE_PAINT} />
				</GeoJSONSource>

				<!-- Attribution -->
				<div
					class="absolute bottom-1 left-1 z-10 text-[9px] text-muted-ink bg-paper/85
					       px-1.5 py-0.5 rounded pointer-events-none"
				>
					© <a href="https://openstreetmap.org" class="pointer-events-auto underline-offset-1 hover:underline" target="_blank" rel="noopener">OpenStreetMap</a>
					· <a href="https://protomaps.com" class="pointer-events-auto underline-offset-1 hover:underline" target="_blank" rel="noopener">Protomaps</a>
					· ONS Open Geography
				</div>

				{#if store.selectedStakeholder && store.mode.type === 'idle'}
					<MapPopup
						lnglat={store.selectedStakeholder.lngLat}
						onclose={() => store.selectStakeholder(null)}
						component={StakeholderPopup}
						props={{ stakeholderId: store.selectedStakeholder.stakeholderId }}
					/>
				{/if}
			</MapLibre>
		{/if}
	</div>
{/if}

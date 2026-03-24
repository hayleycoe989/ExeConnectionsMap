<script lang="ts">
	import {
		MapLibre,
		NavigationControl,
		VectorTileSource,
		FillLayer,
		LineLayer,
	} from 'svelte-maplibre-gl';
	import type { Map as MapType, MapMouseEvent, MapLayerMouseEvent, MapSourceDataEvent } from 'maplibre-gl';
	import type { Stakeholder } from '$lib/types';
	import { PMTilesProtocol } from '@svelte-maplibre-gl/pmtiles';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { onMount, tick } from 'svelte';
	import { browser } from '$app/environment';
	import { store } from '$lib/store.svelte';
	import {
		MAP_CONFIG,
		LSOA_URL,
		BASEMAP_URL,
		LSOA_FILL_PAINT,
		LSOA_OUTLINE_PAINT,
	} from '$lib/mapConfig';
	import MapPopup from './MapPopup.svelte';
	import LsoaPopup from './LsoaPopup.svelte';
	import SelectionBanner from './SelectionBanner.svelte';
	import MapLegend from './MapLegend.svelte';

	let map = $state<MapType | undefined>();
	let protocolReady = $state(false);
	let mapStyle = $state<object | undefined>();

	onMount(async () => {
		await tick();
		protocolReady = true;
		const res = await fetch('/style.json');
		const style = await res.json();
		// Replace the hardcoded demo-bucket URL with the env-configured basemap URL
		style.sources.protomaps.url = BASEMAP_URL;
		mapStyle = style;
		store.loadFromServer();
	});

	// Re-apply feature states when stakeholder counts change
	$effect(() => {
		if (!map) return;
		// Read the reactive map to track changes
		const countMap = store.lsoaCountMap;
		applyFeatureStates(countMap);
	});

	// Re-apply after mode changes (entering/leaving selection mode)
	$effect(() => {
		if (!map) return;
		const mode = store.mode;
		if (mode.type === 'lsoa-selection') {
			map.getCanvas().style.cursor = 'crosshair';
		} else {
			map.getCanvas().style.cursor = '';
		}
		// Re-apply selected states for the active stakeholder
		applySelectionStates();
	});

	function applyFeatureStates(countMap: Map<string, number>) {
		if (!map) return;
		if (!map.isStyleLoaded()) {
			map.once('idle', () => applyFeatureStates(store.lsoaCountMap));
			return;
		}
		// Clear all existing stakeholder counts first
		// (can't enumerate all features in a PMTiles source, so we iterate known codes)
		const allCodes = new Set<string>();
		for (const s of store.stakeholders) {
			for (const code of s.lsoaCodes) allCodes.add(code);
		}
		for (const code of allCodes) {
			map.setFeatureState(
				{ source: 'lsoa-source', sourceLayer: 'lsoa', id: code },
				{ stakeholderCount: countMap.get(code) ?? 0 },
			);
		}
	}

	function applySelectionStates() {
		if (!map) return;
		const mode = store.mode;
		const activeId = mode.type === 'lsoa-selection' ? mode.stakeholderId : null;
		const activeCodes = activeId
			? (store.stakeholders.find((s: Stakeholder) => s.id === activeId)?.lsoaCodes ?? [])
			: [];

		for (const s of store.stakeholders) {
			for (const code of s.lsoaCodes) {
				map.setFeatureState(
					{ source: 'lsoa-source', sourceLayer: 'lsoa', id: code },
					{ selected: activeCodes.includes(code) },
				);
			}
		}
	}

	function handleLsoaClick(e: MapLayerMouseEvent) {
		if (!map) return;

		const props = e.features?.[0]?.properties as { LSOA21CD?: string; LSOA21NM?: string } | undefined;
		const lsoaCode = props?.LSOA21CD ?? '';
		const lsoaName = props?.LSOA21NM ?? lsoaCode;

		if (!lsoaCode) return;

		if (store.mode.type === 'lsoa-selection') {
			store.toggleLsoaAssignment(store.mode.stakeholderId, lsoaCode);
			// Immediate visual update
			const isAssigned = store.isLsoaAssigned(store.mode.stakeholderId, lsoaCode);
			map.setFeatureState(
				{ source: 'lsoa-source', sourceLayer: 'lsoa', id: lsoaCode },
				{
					stakeholderCount: store.lsoaCountMap.get(lsoaCode) ?? 0,
					selected: isAssigned,
				},
			);
		} else {
			store.selectLsoa({ lsoaCode, lsoaName, lngLat: [e.lngLat.lng, e.lngLat.lat] });
		}

		e.originalEvent.stopPropagation();
	}

	function handleMapClick() {
		if (store.mode.type === 'idle') {
			store.selectLsoa(null);
		}
	}

	function handleCursorEnter() {
		if (map && store.mode.type !== 'lsoa-selection') {
			map.getCanvas().style.cursor = 'pointer';
		}
	}

	function handleCursorLeave() {
		if (map && store.mode.type !== 'lsoa-selection') {
			map.getCanvas().style.cursor = '';
		}
	}

	let hoveredLsoaId = $state<string | null>(null);

	function handleLsoaMouseEnter(e: MapLayerMouseEvent) {
		if (!map) return;
		const code = (e.features?.[0]?.properties as { LSOA21CD?: string } | undefined)?.LSOA21CD;
		if (!code) return;
		if (hoveredLsoaId && hoveredLsoaId !== code) {
			map.setFeatureState(
				{ source: 'lsoa-source', sourceLayer: 'lsoa', id: hoveredLsoaId },
				{ hovered: false },
			);
		}
		hoveredLsoaId = code;
		map.setFeatureState(
			{ source: 'lsoa-source', sourceLayer: 'lsoa', id: code },
			{ hovered: true },
		);
		handleCursorEnter();
	}

	function handleLsoaMouseLeave() {
		if (!map || !hoveredLsoaId) return;
		map.setFeatureState(
			{ source: 'lsoa-source', sourceLayer: 'lsoa', id: hoveredLsoaId },
			{ hovered: false },
		);
		hoveredLsoaId = null;
		handleCursorLeave();
	}

	// Re-apply feature states after tiles load
	$effect(() => {
		if (!map) return;
		function onSourceData(e: MapSourceDataEvent) {
			if (e.sourceId === 'lsoa-source' && e.isSourceLoaded) {
				applyFeatureStates(store.lsoaCountMap);
				applySelectionStates();
			}
		}
		map.on('sourcedata', onSourceData);
		return () => map?.off('sourcedata', onSourceData);
	});
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

				<!-- LSOA choropleth — inserted below label layers -->
				<VectorTileSource
					id="lsoa-source"
					url={LSOA_URL}
					promoteId={{ lsoa: 'LSOA21CD' }}
				>
					<FillLayer
						id="lsoa-fill"
						sourceLayer="lsoa"
						beforeId="address_label"
						paint={LSOA_FILL_PAINT}
						onclick={handleLsoaClick}
						onmousemove={handleLsoaMouseEnter}
						onmouseleave={handleLsoaMouseLeave}
					/>
					<LineLayer
						id="lsoa-outline"
						sourceLayer="lsoa"
						beforeId="address_label"
						paint={LSOA_OUTLINE_PAINT}
					/>
				</VectorTileSource>

				<!-- Attribution -->
				<div
					class="absolute bottom-1 left-1 z-10 text-[9px] text-slate-600 bg-white/90
					       px-1.5 py-0.5 rounded pointer-events-none"
				>
					© <a href="https://openstreetmap.org" class="pointer-events-auto underline-offset-1 hover:underline text-slate-700" target="_blank" rel="noopener">OpenStreetMap</a>
					· <a href="https://protomaps.com" class="pointer-events-auto underline-offset-1 hover:underline text-slate-700" target="_blank" rel="noopener">Protomaps</a>
					· ONS Open Geography
				</div>

				{#if store.selectedLsoa && store.mode.type === 'idle'}
					<MapPopup
						lnglat={store.selectedLsoa.lngLat}
						onclose={() => store.selectLsoa(null)}
						component={LsoaPopup}
						props={{ info: store.selectedLsoa }}
					/>
				{/if}
			</MapLibre>
		{/if}
	</div>
{/if}

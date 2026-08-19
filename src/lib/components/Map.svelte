<script lang="ts">
	import {
		MapLibre,
		NavigationControl,
		GeoJSONSource,
		FillLayer,
		LineLayer,
		CircleLayer,
	} from 'svelte-maplibre-gl';
	import type { Map as MapType, MapLayerMouseEvent, StyleSpecification } from 'maplibre-gl';
	import type { Feature, FeatureCollection, Polygon } from 'geojson';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { store } from '$lib/store.svelte';
	import {
		MAP_CONFIG,
		CATEGORY_COLOURS,
		GROUP_COLOURS,
		CONNECTION_FILL_PAINT,
		CONNECTION_LINE_PAINT,
		BEDROCK_FILL_PAINT,
		BEDROCK_LINE_PAINT,
		HABITAT_LAYER_COLOURS,
	} from '$lib/mapConfig';
	import type { Component } from 'svelte';
	import MapPopup from './MapPopup.svelte';
	import ConnectionPopup from './ConnectionPopup.svelte';
	import SelectionBanner from './SelectionBanner.svelte';
	import MapLegend from './MapLegend.svelte';

let mapComponent = $state<any>(null);
let map = $state<MapType | null>(null);





	function handleLayerClick(type: string) {
  		return (e: MapLayerMouseEvent) => {
			const feature = e.features?.[0];
			if (!feature) return;
		
		console.log("=== POPUP DIAGNOSTICS ===");
		console.log("Layer key:", type);
		console.log("Clicked feature:", feature);
		console.log("Feature properties:", feature?.properties);
		console.log("Popup type that will be set:", type);
		console.log("==========================");


    	store.setPopup({
    	  type,
    	  lngLat: [e.lngLat.lng, e.lngLat.lat],
    	  props: feature.properties
    	});
  		};
	}

	import LsoaExePopup from './LsoaExePopup.svelte';
	import CountryParksPopup from './CountryParksPopup.svelte';
	import BedrockPopup from './BedrockPopup.svelte';
	import WmsPopup from './WmsPopup.svelte';
	import ExeRiversPopup from './ExeRiversPopup.svelte';
	import ExeBoardersPopup from './ExeBoardersPopup.svelte';
	import FloodRiskPopup from './FloodRiskPopup.svelte';
	import WetlandPopup from './WetlandPopup.svelte';
	import ExeRainforestPopup from './ExeRainforestPopup.svelte';
	import SalmonMigrationPopup from './SalmonMigrationPopup.svelte';
	import TemperateRainforestPopup from './TemperateRainforestPopup.svelte';

	const POPUP_COMPONENTS: Record<string, any> = {
	lsoaexe: LsoaExePopup,
	countryparks: CountryParksPopup,
	bedrock: BedrockPopup,
	wms: WmsPopup,
	exerivers: ExeRiversPopup,
	exeboarders: ExeBoardersPopup,
	floodrisk: FloodRiskPopup,
	wetland: WetlandPopup,
	exerainforest: ExeRainforestPopup,
	salmonmigration: SalmonMigrationPopup,
	temperaterainforest: TemperateRainforestPopup
	};


	
	let mapStyle = $state<StyleSpecification | undefined>();
	let lsoaData = $state<FeatureCollection | null>(null);
	let countryParksData = $state<FeatureCollection | null>(null);
	let bedrockData = $state<FeatureCollection | null>(null);
	let wmsData = $state<FeatureCollection | null>(null);
	let riverexeData = $state<FeatureCollection | null>(null);
	let boardersData = $state<FeatureCollection | null>(null);
	let floodriskData = $state<FeatureCollection | null>(null);
	let wetlandData = $state<FeatureCollection | null>(null);
	let exerfData = $state<FeatureCollection | null>(null);
	let salmigData = $state<FeatureCollection |null>(null);
	let temprfData = $state<FeatureCollection |null>(null);


	onMount(async () => {
		store.setPopup(null);

		const res = await fetch('/basemap-style.json');
		const style = await res.json();
		mapStyle = style;
		const [
 	 		riverResponse,
  			lsoaResponse,
			countryParksResponse,
			bedrockResponse,
			wmsResponse,
			riverexeResponse,
			boardersResponse,
			floodriskResponse,
			wetlandResponse,
			exerfResponse,
			salmigResponse,
			temprfResponse,
		] = await Promise.all([
			fetch('/river-exe.geojson'),
			fetch('/lsoa-exe.geojson'),
			fetch('/CountryParks.geojson'),
			fetch('/Exe_Bedrock.geojson'),
			fetch('/Exe_WMS.geojson'),
			fetch('/Exe_Rivers.geojson'),
  			fetch('/Exe_Boarders.geojson'),
			fetch('/Flood_Risk.geojson'),
			fetch('/Wetland.geojson'),
			fetch('/Exe_Rainforest.geojson'),
			fetch('/Salmon_Migration.geojson'),
			fetch('/Tempurate_Rainforest.geojson'),



		]);

		if (lsoaResponse.ok) lsoaData = await lsoaResponse.json();
		if (countryParksResponse.ok) countryParksData = await countryParksResponse.json();
		if (bedrockResponse.ok) bedrockData = await bedrockResponse.json();
		if (wmsResponse.ok) wmsData = await wmsResponse.json();
		if (riverexeResponse.ok) riverexeData = await riverexeResponse.json();
		if (boardersResponse.ok) boardersData = await boardersResponse.json();
		if (floodriskResponse.ok) floodriskData = await floodriskResponse.json();
		if (wetlandResponse.ok) wetlandData = await wetlandResponse.json();
		if (exerfResponse.ok) exerfData = await exerfResponse.json();
		if (salmigResponse.ok) salmigData = await salmigResponse.json();
		if (temprfResponse.ok) temprfData = await temprfResponse.json();

		

	});




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
    		map?.setFeatureState({ source: 'connections', id: hoveredId }, { hovered: false });
  		}

 		 hoveredId = id;

  	map?.setFeatureState({ source: 'connections', id }, { hovered: true });

	const canvas = map?.getCanvas();
	if (canvas) {
		canvas.style.cursor = 'pointer';
	}
	}	

function handlePolygonLeave() {
  if (!map) return;

  if (hoveredId) {
    map?.setFeatureState({ source: 'connections', id: hoveredId }, { hovered: false });
    hoveredId = null;
  }

  if (store.mode.type !== 'draw') {
    const canvas = map?.getCanvas();
    if (canvas) {
      canvas.style.cursor = '';
    }
  }
}

function handleInteractiveEnter() {
	const canvas = map?.getCanvas();
	if (canvas) canvas.style.cursor = 'pointer';
}

function handleInteractiveLeave() {
	if (store.mode.type === 'draw') return;
	const canvas = map?.getCanvas();
	if (canvas) canvas.style.cursor = '';
}

function handleBedrockClick(e: MapLayerMouseEvent) {
  console.log("Bedrock handler fired"); // TEMP DEBUG

  const props = e.features?.[0]?.properties;
  if (!props) {
    console.log("No Bedrock props found");
    return;
  }

  store.setPopup({
    type: 'bedrock',
    props,
    lngLat: [e.lngLat.lng, e.lngLat.lat]
  });

  e.originalEvent.stopPropagation();
}

function handleMapClick() {
	if (store.mode.type === 'idle') {
		store.selectConnection(null);
	}
}

function handleMapLoad() {
  if (!map) return;

  console.log("Map loaded, attaching handlers");

  map.on('click', 'Bedrock-fill', handleBedrockClick);

  map.on('click', 'lsoa-overlay-fill', handleLayerClick('lsoaexe'));

  map.on('click', 'CountryParks-fill', handleLayerClick('countryparks'));
 
  map.on('click', 'WMS-fill', handleLayerClick('wms'));

  map.on('click', 'Exe_Rivers-fill', handleLayerClick('exerivers'));

  map.on('click', 'Exe_Boarders-fill', handleLayerClick('exeboarders'));

  map.on('click', 'Flood_Risk-fill', handleLayerClick('floodrisk'));

  map.on('click', 'Wetland-fill', handleLayerClick('wetland'));
 
  map.on('click', 'Exe_Rainforest-fill', handleLayerClick('exerainforest'));

  map.on('click', 'Salmon_Migration-fill', handleLayerClick('salmonmigration'));

  map.on('click', 'Tempurate_Rainforest-fill', handleLayerClick('temperaterainforest'));
}




</script>

{#if browser}
	<div class="relative w-full h-full overflow-hidden">
		{#if !mapStyle}
			<div class="absolute inset-0 flex items-center justify-center bg-background">
				<div class="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
			</div>
		{/if}
		{#if mapStyle}
			<MapLibre
				bind:this={mapComponent}
				bind:map
				class="w-full h-full"
				{...MAP_CONFIG}
				attributionControl={false}
				style={mapStyle}
				onclick={handleMapClick}
			>
				<NavigationControl position="bottom-right" />


				{#if lsoaData && !store.hiddenLayers.has('lsoa')}
					<GeoJSONSource id="lsoa-overlay" data={lsoaData}>
						<FillLayer
							id="lsoa-overlay-fill"
							paint={{ 'fill-color': GROUP_COLOURS.administrative, 'fill-opacity': 0.04 }}
						/>
						<LineLayer
							id="lsoa-overlay-line"
							paint={{ 'line-color': GROUP_COLOURS.administrative, 'line-width': 0.8, 'line-opacity': 0.55 }}
						onclick={handleLayerClick('lsoaexe')}
						onmousemove={handleInteractiveEnter}
						onmouseleave={handleInteractiveLeave}
						/>
					</GeoJSONSource>
				{/if}

				{#if countryParksData && !store.hiddenLayers.has('CountryParks')}
					<GeoJSONSource id="CountryParks-overlay" data={countryParksData}>
        				<FillLayer
           					id="CountryParks-fill"
            				paint={{'fill-color': GROUP_COLOURS.recreational,'fill-opacity': 0.18 }}
						/>
        				<LineLayer
            				id="CountryParks-line"
            				paint={{'line-color': GROUP_COLOURS.recreational, 'line-width': 1, 'line-opacity': 0.8, }}
        				onclick={handleLayerClick('countryparks')}
        				onmousemove={handleInteractiveEnter}
        				onmouseleave={handleInteractiveLeave}
						/>
    				</GeoJSONSource>
				{/if}

				{#if bedrockData && !store.hiddenLayers.has('Exe_Bedrock')}
					<GeoJSONSource id="Bedrock-overlay" data={bedrockData}>
  						<LineLayer
    						id="Bedrock-line"
								paint={BEDROCK_LINE_PAINT}
						/>

						<FillLayer
							id="Bedrock-fill"
							paint={BEDROCK_FILL_PAINT}
							onclick={handleBedrockClick}
							onmousemove={handleInteractiveEnter}
							onmouseleave={handleInteractiveLeave}
						/>
					</GeoJSONSource>
			{/if}




			{#if wmsData && !store.hiddenLayers.has('WMS')}
				<GeoJSONSource id="Exe_WMS-overlay" data={wmsData}>
	        		<CircleLayer
	    			id="wms-circle"
	        			paint={{
					'circle-color': GROUP_COLOURS.hydrological,
					'circle-radius': 4,
					'circle-opacity': 0.85,
				}}
				onclick={handleLayerClick('wms')}
				onmousemove={handleInteractiveEnter}
				onmouseleave={handleInteractiveLeave}
				/>
				</GeoJSONSource>
			{/if}

			{#if riverexeData && !store.hiddenLayers.has('Exe_Rivers')}
				<GeoJSONSource id="exeriver-overlay" data={riverexeData}>
					<LineLayer
					id="riverexe-line"
					paint={{
						'line-color': GROUP_COLOURS.hydrological,
						'line-width': 2.5,
						'line-opacity': 0.95,
					}}
					layout={{
						'line-join': 'round',
						'line-cap': 'round',
					}}
					onclick={handleLayerClick('exerivers')}
					onmousemove={handleInteractiveEnter}
					onmouseleave={handleInteractiveLeave}
					/>
				</GeoJSONSource>
				{/if}

			{#if boardersData && !store.hiddenLayers.has('Exe_Boarders')}
				<GeoJSONSource id="boarders-overlay" data={boardersData}>
					<LineLayer
					id="boarders-line"
					paint={{
						'line-color': GROUP_COLOURS.geographic,
						'line-width': 2.5,
						'line-opacity': 0.95,
					}}
					layout={{
						'line-join': 'round',
						'line-cap': 'round',
					}}
					onclick={handleLayerClick('exeboarders')}
					onmousemove={handleInteractiveEnter}
					onmouseleave={handleInteractiveLeave}
					/>
				</GeoJSONSource>
				{/if}
			
			{#if floodriskData && !store.hiddenLayers.has('Flood_Risk')}
				<GeoJSONSource id="floodrisk-overlay" data={floodriskData}>
					<LineLayer
					id="floodrisk-line"
					paint={{
						'line-color': GROUP_COLOURS.hydrological,
						'line-width': 2.5,
						'line-opacity': 0.95,
					}}
					layout={{
						'line-join': 'round',
						'line-cap': 'round',
					}}
					onclick={handleLayerClick('floodrisk')}
					onmousemove={handleInteractiveEnter}
					onmouseleave={handleInteractiveLeave}
					/>
				</GeoJSONSource>
				{/if}
			
			{#if wetlandData && !store.hiddenLayers.has('Wetland')}
				<GeoJSONSource id="wetlands-overlay" data={wetlandData}>
					<FillLayer
					id="wetlands-fill"
					paint={{ 'fill-color': GROUP_COLOURS.habitat, 
					'fill-opacity': 0.18 }}
					onclick={handleLayerClick('wetland')}
					onmousemove={handleInteractiveEnter}
					onmouseleave={handleInteractiveLeave}
					/>
					</GeoJSONSource>
				{/if}

			{#if exerfData && !store.hiddenLayers.has('ExeRF')}
				<GeoJSONSource id="exerf-overlay" data={exerfData}>
					<FillLayer
					id="exerf-fill"
					paint={{ 'fill-color': HABITAT_LAYER_COLOURS.ExeRF.fill,
					'fill-opacity': 0.28 }}
					onclick={handleLayerClick('exerainforest')}
					onmousemove={handleInteractiveEnter}
					onmouseleave={handleInteractiveLeave}
					/>
					<LineLayer
					id="exerf-line"
					paint={{ 'line-color': HABITAT_LAYER_COLOURS.ExeRF.border,
					'line-width': 1.5,
					'line-opacity': 0.9 }}
					/>
					</GeoJSONSource>
				{/if}

			{#if salmigData && !store.hiddenLayers.has('SalMig')}
				<GeoJSONSource id="salmig-overlay" data={salmigData}>
					<FillLayer
					id="salmig-fill"
					paint={{ 'fill-color': HABITAT_LAYER_COLOURS.SalMig.fill,
					'fill-opacity': 0.28 }}
					onclick={handleLayerClick('salmonmigration')}
					onmousemove={handleInteractiveEnter}
					onmouseleave={handleInteractiveLeave}
					/>
					<LineLayer
					id="salmig-line"
					paint={{ 'line-color': HABITAT_LAYER_COLOURS.SalMig.border,
					'line-width': 1.5,
					'line-opacity': 0.9 }}
					/>
				</GeoJSONSource>
				{/if}
		
			{#if temprfData && !store.hiddenLayers.has('TempRF')}
				<GeoJSONSource id="temprf-overlay" data={temprfData}>
					<FillLayer
					id="temprf-fill"
					paint={{ 'fill-color': HABITAT_LAYER_COLOURS.TempRF.fill,
					'fill-opacity': 0.28 }}
					onclick={handleLayerClick('temperaterainforest')}
					onmousemove={handleInteractiveEnter}
					onmouseleave={handleInteractiveLeave}
					/>
					<LineLayer
					id="temprf-line"
					paint={{ 'line-color': HABITAT_LAYER_COLOURS.TempRF.border,
					'line-width': 1.5,
					'line-opacity': 0.9 }}
					/>
				</GeoJSONSource>
				{/if}
			
				<SelectionBanner />
				<MapLegend />

				{#if map && DrawControl}
					{@const DC = DrawControl}
					<DC {map} />
				{/if}

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

				<div
					class="absolute bottom-1 left-1 z-10 text-[9px] text-muted-ink bg-paper/90 border border-rule
					       px-1.5 py-0.5 rounded-sm pointer-events-none"
				>
					© <a href="https://openstreetmap.org" class="pointer-events-auto underline-offset-1 hover:underline" target="_blank" rel="noopener">OpenStreetMap</a>
					· ONS Open Geography
				</div>

				{#if store.popup}
 					 {#if POPUP_COMPONENTS[store.popup.type] === undefined}
					<div class="p-3 bg-red-200 text-red-900">
					Popup component NOT FOUND for type: {store.popup.type}
					</div>
				{:else}
					<MapPopup
					lnglat={store.popup.lngLat}
					onclose={() => store.setPopup(null)}
					component={POPUP_COMPONENTS[store.popup.type]}
					props={store.popup.props}
					/>
				{/if}
			{/if}


			</MapLibre>
			
		{/if}
	</div>
{/if}

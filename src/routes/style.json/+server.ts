import { json } from '@sveltejs/kit';
import { PUBLIC_BASEMAP_URL } from '$env/static/public';

export function GET() {
	const style = {
		version: 8,
		name: 'Protomaps Light',
		glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
		sprite: 'https://protomaps.github.io/basemaps-assets/sprites/v4/light',
		sources: {
			protomaps: {
				type: 'vector',
				url: `pmtiles://${PUBLIC_BASEMAP_URL}`,
				attribution:
					'© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, © <a href="https://protomaps.com">Protomaps</a>',
			},
		},
		layers: [
			{ id: 'background', type: 'background', paint: { 'background-color': '#f8f8f4' } },
			{
				id: 'earth',
				type: 'fill',
				source: 'protomaps',
				'source-layer': 'earth',
				paint: { 'fill-color': '#f1ede3' },
			},
			{
				id: 'landuse_park',
				type: 'fill',
				source: 'protomaps',
				'source-layer': 'landuse',
				filter: ['in', 'pmap:kind', 'park', 'nature_reserve', 'forest', 'wood'],
				paint: { 'fill-color': '#d8edcc', 'fill-opacity': 0.7 },
			},
			{
				id: 'landuse_residential',
				type: 'fill',
				source: 'protomaps',
				'source-layer': 'landuse',
				filter: ['in', 'pmap:kind', 'residential', 'suburb', 'neighbourhood'],
				paint: { 'fill-color': '#ede8e0', 'fill-opacity': 0.5 },
			},
			{
				id: 'water',
				type: 'fill',
				source: 'protomaps',
				'source-layer': 'water',
				paint: { 'fill-color': '#a8d4e8' },
			},
			{
				id: 'waterway',
				type: 'line',
				source: 'protomaps',
				'source-layer': 'waterway',
				paint: {
					'line-color': '#a8d4e8',
					'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.5, 14, 2],
				},
			},
			{
				id: 'road_minor',
				type: 'line',
				source: 'protomaps',
				'source-layer': 'roads',
				filter: ['in', 'pmap:kind', 'minor_road', 'service'],
				paint: {
					'line-color': '#ffffff',
					'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.5, 16, 2],
				},
			},
			{
				id: 'road_major',
				type: 'line',
				source: 'protomaps',
				'source-layer': 'roads',
				filter: ['in', 'pmap:kind', 'primary', 'secondary', 'tertiary'],
				paint: {
					'line-color': '#f5e8c0',
					'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.5, 14, 3],
				},
			},
			{
				id: 'road_motorway',
				type: 'line',
				source: 'protomaps',
				'source-layer': 'roads',
				filter: ['==', 'pmap:kind', 'highway'],
				paint: {
					'line-color': '#f4c778',
					'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.5, 14, 5],
				},
			},
			{
				id: 'place_town',
				type: 'symbol',
				source: 'protomaps',
				'source-layer': 'places',
				filter: ['in', 'pmap:kind', 'town', 'village', 'hamlet'],
				layout: {
					'text-field': ['get', 'name'],
					'text-font': ['Noto Sans Regular'],
					'text-size': ['interpolate', ['linear'], ['zoom'], 10, 10, 14, 13],
					'text-anchor': 'center',
				},
				paint: {
					'text-color': '#4a4035',
					'text-halo-color': '#fff',
					'text-halo-width': 1.5,
				},
			},
			{
				id: 'place_city',
				type: 'symbol',
				source: 'protomaps',
				'source-layer': 'places',
				filter: ['in', 'pmap:kind', 'city'],
				layout: {
					'text-field': ['get', 'name'],
					'text-font': ['Noto Sans Regular'],
					'text-size': ['interpolate', ['linear'], ['zoom'], 8, 12, 14, 18],
					'text-anchor': 'center',
				},
				paint: {
					'text-color': '#2c2416',
					'text-halo-color': '#fff',
					'text-halo-width': 2,
				},
			},
		],
	};

	return json(style, {
		headers: {
			'Cache-Control': 'public, max-age=3600',
		},
	});
}

import type { ExpressionSpecification } from 'maplibre-gl';
import { PUBLIC_LSOA_TILES_URL, PUBLIC_BASEMAP_URL } from '$env/static/public';

export const LSOA_URL = `pmtiles://${PUBLIC_LSOA_TILES_URL}`;
export const BASEMAP_URL = `pmtiles://${PUBLIC_BASEMAP_URL}`;

export const MAP_CONFIG = {
	center: [-3.42, 50.62] as [number, number],
	zoom: 11,
	minZoom: 9,
	maxZoom: 18,
	pitch: 0,
	bearing: 0,
	fadeDuration: 200,
	maxTileCacheSize: 150,
};

// Sequential blue choropleth scale (0 → 6+ stakeholders)
export const CHOROPLETH_COLOURS = {
	zero: '#f0f7ff',
	one: '#bdd7ee',
	two: '#6baed6',
	four: '#2171b5',
	six: '#084594',
} as const;

const expr = <T>(v: unknown) => v as unknown as T;

export const LSOA_FILL_PAINT = {
	'fill-color': expr<ExpressionSpecification>([
		'step',
		['coalesce', ['feature-state', 'stakeholderCount'], 0],
		CHOROPLETH_COLOURS.zero,
		1, CHOROPLETH_COLOURS.one,
		2, CHOROPLETH_COLOURS.two,
		4, CHOROPLETH_COLOURS.four,
		6, CHOROPLETH_COLOURS.six,
	]),
	'fill-opacity': expr<ExpressionSpecification>([
		'case',
		['boolean', ['feature-state', 'hovered'], false], 0.75,
		0.55,
	]),
};

export const LSOA_OUTLINE_PAINT = {
	'line-color': '#94a3b8',
	'line-width': expr<ExpressionSpecification>([
		'interpolate', ['linear'], ['zoom'],
		8, 0.3,
		12, 0.8,
	]),
	'line-opacity': 0.5 as number,
};

export const RIVER_LINE_PAINT = {
	'line-color': '#0077b6',
	'line-width': expr<ExpressionSpecification>([
		'interpolate', ['linear'], ['zoom'],
		9, 1.5,
		13, 3,
	]),
	'line-opacity': 0.85 as number,
};

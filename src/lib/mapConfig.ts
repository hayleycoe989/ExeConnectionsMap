import type { ExpressionSpecification } from 'maplibre-gl';
import { PUBLIC_BASEMAP_URL } from '$env/static/public';
import type { StakeholderCategory } from '$lib/types';

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

// Hex literals matching the OKLCH category tokens defined in src/app.css.
// MapLibre paint specs can't reference CSS custom properties, so we maintain
// these as static colours that mirror the design tokens.
export const CATEGORY_COLOURS: Record<StakeholderCategory, string> = {
	Environmental: '#3a7a52',
	Recreational: '#9c5b2c',
	Educational: '#3d5a8a',
	Commercial: '#7a4a78',
	Political: '#8c4848',
};

const expr = <T>(v: unknown) => v as unknown as T;

const categoryMatch = (alpha: number) => [
	'match',
	['get', 'category'],
	'Environmental', `${CATEGORY_COLOURS.Environmental}`,
	'Recreational', `${CATEGORY_COLOURS.Recreational}`,
	'Educational', `${CATEGORY_COLOURS.Educational}`,
	'Commercial', `${CATEGORY_COLOURS.Commercial}`,
	'Political', `${CATEGORY_COLOURS.Political}`,
	'#1f2330', // fallback ink
] as const;

export const STAKEHOLDER_FILL_PAINT = {
	'fill-color': expr<ExpressionSpecification>(categoryMatch(0)),
	'fill-opacity': expr<ExpressionSpecification>([
		'case',
		['boolean', ['feature-state', 'hovered'], false], 0.32,
		0.18,
	]),
};

export const STAKEHOLDER_LINE_PAINT = {
	'line-color': expr<ExpressionSpecification>(categoryMatch(0)),
	'line-width': expr<ExpressionSpecification>([
		'case',
		['boolean', ['feature-state', 'hovered'], false], 2,
		1.25,
	]),
	'line-opacity': 0.85 as number,
};

import type { ExpressionSpecification } from 'maplibre-gl';
import type { ConnectionCategory } from '$lib/types';

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

export const CATEGORY_COLOURS: Record<ConnectionCategory, string> = {
	Environmental: '#3a7a52',
	Recreational: '#9c5b2c',
	Educational: '#3d5a8a',
	Commercial: '#7a4a78',
	Habitat: '#a2a457'
};

export const CATEGORY_LAYERS: Partial<
	Record<ConnectionCategory, { id: string; label: string }[]>
> = {
	Environmental: [
		{id: 'lsoa', label: 'LSOA boundaries' },
		{id: `Exe_Bedrock`, label: `Bedrock Geology` },
		{id: 'Exe_Rivers', label: 'The River Exe' },
		{id: 'Exe_Boarders', label: 'Exe Catchment Extent' },
		{id: 'Flood_Risk', label: 'Flood Risk'},
		{id: 'Wetland', label: 'Wetlands'}
	],
    Recreational: [
        { id: 'CountryParks', label: 'Country Parks', },
    ],
	Educational: [
		{id: 'WMS', label: 'Water Monitoring Sites' },
	],	
	Habitat: [
		{id: 'ExeRF', label: 'Temperate Rainforests'},
		{id: 'SalMig', label: 'Salmon Migration'},
		{id: 'TempRF', label: 'Possible Temperate Rainforests'},
	]
};

export const MAP_LAYER_GROUPS = [
] as const;

const expr = <T>(v: unknown) => v as unknown as T;

const categoryMatch = (alpha: number) => [
	'match',
	['get', 'category'],
	'Environmental', `${CATEGORY_COLOURS.Environmental}`,
	'Recreational', `${CATEGORY_COLOURS.Recreational}`,
	'Educational', `${CATEGORY_COLOURS.Educational}`,
	'Commercial', `${CATEGORY_COLOURS.Commercial}`,
	'Habitat', `${CATEGORY_COLOURS.Habitat}`,
	'#1f2330',
] as const;

export const CONNECTION_FILL_PAINT = {
	'fill-color': expr<ExpressionSpecification>(categoryMatch(0)),
	'fill-opacity': expr<ExpressionSpecification>([
		'case',
		['boolean', ['feature-state', 'hovered'], false], 0.32,
		0.18,
	]),
};

export const CONNECTION_LINE_PAINT = {
	'line-color': expr<ExpressionSpecification>(categoryMatch(0)),
	'line-width': expr<ExpressionSpecification>([
		'case',
		['boolean', ['feature-state', 'hovered'], false], 2,
		1.25,
	]),
	'line-opacity': 0.85 as number,
};

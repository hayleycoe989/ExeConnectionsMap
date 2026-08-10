import type { ExpressionSpecification } from 'maplibre-gl';
import type { ConnectionCategory } from '$lib/types';

const expr = <T>(v: unknown) => v as unknown as T;

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
	Environmental: '#1b9e77',
	Recreational: '#d95f02',
	Educational: '#7570b3',
	Commercial: '#e7298a',
	Habitat: '#66a61e'
};

//wgs colours
export const BEDROCK_PERIOD_COLOURS: Record<string, string> = {
	CARBONIFEROUS: '#66D9B2',
	CRETACEOUS: '#7FC64E',
	DEVONIAN: '#CB8C37',
	PALAEOGENE: '#FD9A52',
	PERMIAN: '#F24040',
	TRIASSIC: '#8033FF',
};

const BEDROCK_FALLBACK_COLOUR = '#cccccc';

export const BEDROCK_FILL_PAINT = {
	'fill-color': expr<ExpressionSpecification>([
		'match',
		['get', 'MAX_PERIOD'],
		'CARBONIFEROUS', BEDROCK_PERIOD_COLOURS.CARBONIFEROUS,
		'CRETACEOUS', BEDROCK_PERIOD_COLOURS.CRETACEOUS,
		'DEVONIAN', BEDROCK_PERIOD_COLOURS.DEVONIAN,
		'PALAEOGENE', BEDROCK_PERIOD_COLOURS.PALAEOGENE,
		'PERMIAN', BEDROCK_PERIOD_COLOURS.PERMIAN,
		'TRIASSIC', BEDROCK_PERIOD_COLOURS.TRIASSIC,
		BEDROCK_FALLBACK_COLOUR,
	] as const),
	'fill-opacity': expr<ExpressionSpecification>([
		'case',
		['boolean', ['feature-state', 'hovered'], false], 0.75,
		0.6,
	]),
};

export const BEDROCK_LINE_PAINT = {
	'line-color': expr<ExpressionSpecification>([
		'match',
		['get', 'MAX_PERIOD'],
		'CARBONIFEROUS', BEDROCK_PERIOD_COLOURS.CARBONIFEROUS,
		'CRETACEOUS', BEDROCK_PERIOD_COLOURS.CRETACEOUS,
		'DEVONIAN', BEDROCK_PERIOD_COLOURS.DEVONIAN,
		'PALAEOGENE', BEDROCK_PERIOD_COLOURS.PALAEOGENE,
		'PERMIAN', BEDROCK_PERIOD_COLOURS.PERMIAN,
		'TRIASSIC', BEDROCK_PERIOD_COLOURS.TRIASSIC,
		BEDROCK_FALLBACK_COLOUR,
	] as const),
	'line-width': expr<ExpressionSpecification>([
		'case',
		['boolean', ['feature-state', 'hovered'], false], 1.5,
		0.5,
	]),
	'line-opacity': 0.9 as number,
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

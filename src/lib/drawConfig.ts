// Style array for @mapbox/mapbox-gl-draw, tuned to the editorial palette.
// MapLibre paint specs can't reference CSS custom properties, so colours are
// hex literals chosen to match the OKLCH tokens in src/app.css.
//
// active = the feature currently being drawn or edited
// inactive = features sitting in the draw control's read-only buffer
// We don't render inactive features in the draw layer — the read-only
// connection GeoJSON layer does that — so inactive styles are deliberately
// transparent.

const PRIMARY_INK = '#1f2330';
const PRIMARY_INK_FILL = '#1f2330';
const VERTEX_FILL = '#fafbfc';
const VERTEX_BORDER = '#1f2330';
const MIDPOINT_FILL = '#9aa0ad';

export const MAPBOX_DRAW_STYLES = [
	// Inactive features — invisible (rendered by connection layer instead).
	{
		id: 'gl-draw-polygon-fill-inactive',
		type: 'fill',
		filter: [
			'all',
			['==', 'active', 'false'],
			['==', '$type', 'Polygon'],
			['!=', 'mode', 'static'],
		],
		paint: { 'fill-color': '#000', 'fill-opacity': 0 },
	},
	{
		id: 'gl-draw-polygon-stroke-inactive',
		type: 'line',
		filter: [
			'all',
			['==', 'active', 'false'],
			['==', '$type', 'Polygon'],
			['!=', 'mode', 'static'],
		],
		paint: { 'line-color': '#000', 'line-width': 0 },
	},
	// Active polygon (being drawn or selected) — fill.
	{
		id: 'gl-draw-polygon-fill-active',
		type: 'fill',
		filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
		paint: {
			'fill-color': PRIMARY_INK_FILL,
			'fill-opacity': 0.12,
		},
	},
	// Active polygon outline.
	{
		id: 'gl-draw-polygon-stroke-active',
		type: 'line',
		filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
		layout: { 'line-cap': 'round', 'line-join': 'round' },
		paint: {
			'line-color': PRIMARY_INK,
			'line-dasharray': [0.4, 2],
			'line-width': 1.5,
		},
	},
	// LineString for the in-progress polygon (before close).
	{
		id: 'gl-draw-line-active',
		type: 'line',
		filter: ['all', ['==', '$type', 'LineString'], ['==', 'active', 'true']],
		layout: { 'line-cap': 'round', 'line-join': 'round' },
		paint: {
			'line-color': PRIMARY_INK,
			'line-dasharray': [0.4, 2],
			'line-width': 1.5,
		},
	},
	// Vertex point halos (white outline around each vertex).
	{
		id: 'gl-draw-polygon-and-line-vertex-stroke-inactive',
		type: 'circle',
		filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
		paint: {
			'circle-radius': 5,
			'circle-color': VERTEX_BORDER,
		},
	},
	// Vertex points themselves.
	{
		id: 'gl-draw-polygon-and-line-vertex-inactive',
		type: 'circle',
		filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
		paint: {
			'circle-radius': 3,
			'circle-color': VERTEX_FILL,
		},
	},
	// Midpoints — for adding new vertices between existing ones.
	{
		id: 'gl-draw-polygon-midpoint',
		type: 'circle',
		filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
		paint: {
			'circle-radius': 2.5,
			'circle-color': MIDPOINT_FILL,
		},
	},
];

export const defaultDrawOptions = {
	displayControlsDefault: false,
	controls: {},
	defaultMode: 'simple_select',
	styles: MAPBOX_DRAW_STYLES,
};

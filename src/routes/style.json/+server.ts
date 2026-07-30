import { json } from '@sveltejs/kit';

export function GET() {
	const style = {
		version: 8,
		name: 'OpenStreetMap Light',
		sources: {
			openstreetmap: {
				type: 'raster',
				tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
				tileSize: 256,
				maxzoom: 19,
				attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			},
		},
		layers: [
			{ id: 'openstreetmap', type: 'raster', source: 'openstreetmap' },
		],
	};

	return json(style, {
		headers: {
			'Cache-Control': 'public, max-age=3600',
		},
	});
}

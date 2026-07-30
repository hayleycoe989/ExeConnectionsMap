import { createReadStream, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import StreamJson from 'stream-json';
import Pick from 'stream-json/filters/Pick.js';
import StreamArray from 'stream-json/streamers/StreamArray.js';

const { parser } = StreamJson;
const { streamArray } = StreamArray;
const { pick } = Pick;

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const BUFFER_KM = 10 * 1.60934;

const BBOX = { minLng: -4.2, maxLng: -2.6, minLat: 50.2, maxLat: 51.2 };

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
	const R = 6371;
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLng = ((lng2 - lng1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
	return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function extractRiverVertices(geojsonPath: string): [number, number][] {
	const data = JSON.parse(readFileSync(geojsonPath, 'utf-8')) as {
		features: Array<{
			geometry: {
				type: string;
				coordinates: unknown;
			};
		}>;
	};

	const vertices: [number, number][] = [];

	for (const feature of data.features) {
		const geom = feature.geometry;
		if (!geom) continue;

		if (geom.type === 'LineString') {
			for (const coord of geom.coordinates as [number, number][]) {
				vertices.push(coord);
			}
		} else if (geom.type === 'MultiLineString') {
			for (const line of geom.coordinates as [number, number][][]) {
				for (const coord of line) vertices.push(coord);
			}
		} else if (geom.type === 'Polygon') {
			for (const ring of geom.coordinates as [number, number][][]) {
				for (const coord of ring) vertices.push(coord);
			}
		} else if (geom.type === 'MultiPolygon') {
			for (const poly of geom.coordinates as [number, number][][][]) {
				for (const ring of poly) {
					for (const coord of ring) vertices.push(coord);
				}
			}
		}
	}

	if (vertices.length > 500) {
		const step = Math.ceil(vertices.length / 500);
		return vertices.filter((_, i) => i % step === 0);
	}

	return vertices;
}

function minDistanceToRiver(lat: number, lng: number, riverVertices: [number, number][]): number {
	let min = Infinity;
	for (const [vLng, vLat] of riverVertices) {
		const d = haversineKm(lat, lng, vLat, vLng);
		if (d < min) min = d;
	}
	return min;
}

interface LsoaProperties {
	LSOA21CD: string;
	LSOA21NM: string;
	LAT: number;
	LONG: number;
	[key: string]: unknown;
}

interface GeoJsonFeature {
	type: 'Feature';
	properties: LsoaProperties;
	geometry: unknown;
}

function main() {
	const riverPath = join(ROOT, 'river-exe.geojson');
	const lsoaPath = join(ROOT, 'lsoa.geojson');
	const outputPath = join(ROOT, 'static', 'lsoa-exe.geojson');

	console.log('Reading River Exe vertices…');
	const riverVertices = extractRiverVertices(riverPath);
	console.log(`  → ${riverVertices.length} vertices extracted`);

	console.log('Streaming and filtering LSOAs…');
	const features: GeoJsonFeature[] = [];
	let total = 0;

	const inputStream = createReadStream(lsoaPath);

	const pipeline = inputStream
		.pipe(parser())
		.pipe(pick({ filter: 'features' }))
		.pipe(streamArray());

	pipeline.on('data', ({ value: feature }: { value: GeoJsonFeature }) => {
		total++;
		const props = feature?.properties;
		if (!props) return;

		const lat = Number(props.LAT);
		const lng = Number(props.LONG);
		if (!lat || !lng) return;

		if (lng < BBOX.minLng || lng > BBOX.maxLng || lat < BBOX.minLat || lat > BBOX.maxLat) return;

		const dist = minDistanceToRiver(lat, lng, riverVertices);
		if (dist <= BUFFER_KM) {
			features.push(feature);
		}
	});

	pipeline.on('end', () => {
		console.log(`  → Scanned ${total} LSOAs, kept ${features.length}`);

		const output = { type: 'FeatureCollection', features };
		writeFileSync(outputPath, JSON.stringify(output));
		console.log(`Written to ${outputPath}`);
	});

	pipeline.on('error', (err: Error) => {
		console.error('Stream error:', err);
		process.exit(1);
	});
}

main();

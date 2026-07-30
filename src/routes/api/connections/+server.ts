import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Connection, ConnectionCategory } from '$lib/types';
import type { Polygon } from 'geojson';

interface ConnectionRow {
	id: string;
	name: string;
	role: string;
	link: string | null;
	categories: string;
	area: string | null;
	created_at: string;
}

function rowToConnection(row: ConnectionRow): Connection {
	return {
		id: row.id,
		name: row.name,
		role: row.role,
		link: row.link ?? undefined,
		categories: JSON.parse(row.categories) as ConnectionCategory[],
		area: row.area ? (JSON.parse(row.area) as Polygon) : null,
		createdAt: row.created_at,
	};
}

const devStore: Map<string, Connection> = (globalThis as any).__riverExeDevStore ??
	((globalThis as any).__riverExeDevStore = new Map<string, Connection>());

export const GET: RequestHandler = async ({ platform }) => {
	const db = platform?.env?.DB;
	if (!db) return json(Array.from(devStore.values()));

	const rows = await db
		.prepare('SELECT * FROM connections ORDER BY created_at ASC')
		.all<ConnectionRow>();
	return json(rows.results.map(rowToConnection));
};

export const POST: RequestHandler = async ({ request, platform }) => {
	const connection = (await request.json()) as Connection;
	const db = platform?.env?.DB;

	if (!db) {
		devStore.set(connection.id, connection);
		return json(connection, { status: 201 });
	}

	await db
		.prepare(
			'INSERT INTO connections (id, name, role, link, categories, area, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
		)
		.bind(
			connection.id,
			connection.name,
			connection.role,
			connection.link ?? null,
			JSON.stringify(connection.categories),
			connection.area ? JSON.stringify(connection.area) : null,
			connection.createdAt,
		)
		.run();

	return json(connection, { status: 201 });
};

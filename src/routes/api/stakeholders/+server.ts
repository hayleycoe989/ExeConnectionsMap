import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Stakeholder, StakeholderCategory } from '$lib/types';

interface StakeholderRow {
	id: string;
	name: string;
	role: string;
	link: string | null;
	categories: string;
	lsoa_codes: string;
	created_at: string;
}

function rowToStakeholder(row: StakeholderRow): Stakeholder {
	return {
		id: row.id,
		name: row.name,
		role: row.role,
		link: row.link ?? undefined,
		categories: JSON.parse(row.categories) as StakeholderCategory[],
		lsoaCodes: JSON.parse(row.lsoa_codes) as string[],
		createdAt: row.created_at,
	};
}

// In-memory fallback for local dev (no D1 binding outside Cloudflare)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const devStore: Map<string, Stakeholder> = (globalThis as any).__riverExeDevStore ??
	((globalThis as any).__riverExeDevStore = new Map<string, Stakeholder>());

export const GET: RequestHandler = async ({ platform }) => {
	const db = platform?.env?.DB;
	if (!db) return json(Array.from(devStore.values()));

	const rows = await db
		.prepare('SELECT * FROM stakeholders ORDER BY created_at ASC')
		.all<StakeholderRow>();
	return json(rows.results.map(rowToStakeholder));
};

export const POST: RequestHandler = async ({ request, platform }) => {
	const stakeholder = (await request.json()) as Stakeholder;
	const db = platform?.env?.DB;

	if (!db) {
		devStore.set(stakeholder.id, stakeholder);
		return json(stakeholder, { status: 201 });
	}

	await db
		.prepare(
			'INSERT INTO stakeholders (id, name, role, link, categories, lsoa_codes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
		)
		.bind(
			stakeholder.id,
			stakeholder.name,
			stakeholder.role,
			stakeholder.link ?? null,
			JSON.stringify(stakeholder.categories),
			JSON.stringify(stakeholder.lsoaCodes),
			stakeholder.createdAt,
		)
		.run();

	return json(stakeholder, { status: 201 });
};

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Stakeholder } from '$lib/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const devStore: Map<string, Stakeholder> = (globalThis as any).__riverExeDevStore ??
	((globalThis as any).__riverExeDevStore = new Map<string, Stakeholder>());

export const PATCH: RequestHandler = async ({ params, request, platform }) => {
	const { id } = params;
	const db = platform?.env?.DB;
	const body = (await request.json()) as { lsoaCodes?: string[] };

	if (!db) {
		const existing = devStore.get(id);
		if (existing && body.lsoaCodes !== undefined) {
			devStore.set(id, { ...existing, lsoaCodes: body.lsoaCodes });
		}
		return json({ success: true });
	}

	if (body.lsoaCodes !== undefined) {
		await db
			.prepare('UPDATE stakeholders SET lsoa_codes = ? WHERE id = ?')
			.bind(JSON.stringify(body.lsoaCodes), id)
			.run();
	}

	return json({ success: true });
};

export const DELETE: RequestHandler = async ({ params, platform }) => {
	const { id } = params;
	const db = platform?.env?.DB;

	if (!db) {
		devStore.delete(id);
		return json({ success: true });
	}

	await db.prepare('DELETE FROM stakeholders WHERE id = ?').bind(id).run();
	return json({ success: true });
};

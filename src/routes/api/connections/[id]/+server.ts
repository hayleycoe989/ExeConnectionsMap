import { json } from '@sveltejs/kit';
import { z } from 'zod';
import type { RequestHandler } from './$types';
import type { Connection } from '$lib/types';
import type { Polygon } from 'geojson';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const devStore: Map<string, Connection> = (globalThis as any).__riverExeDevStore ??
	((globalThis as any).__riverExeDevStore = new Map<string, Connection>());

const polygonSchema = z.object({
	type: z.literal('Polygon'),
	coordinates: z.array(z.array(z.tuple([z.number(), z.number()]).rest(z.number()))),
});

const patchBodySchema = z.object({
	area: polygonSchema.nullable().optional(),
});

export const PATCH: RequestHandler = async ({ params, request, platform }) => {
	const { id } = params;
	const db = platform?.env?.DB;
	const raw = await request.json();
	const parsed = patchBodySchema.safeParse(raw);
	if (!parsed.success) return json({ error: 'Invalid body' }, { status: 400 });
	const body = parsed.data;

	if (!db) {
		const existing = devStore.get(id);
		if (existing && body.area !== undefined) {
			devStore.set(id, { ...existing, area: (body.area ?? null) as Polygon | null });
		}
		return json({ success: true });
	}

	if (body.area !== undefined) {
		await db
			.prepare('UPDATE connections SET area = ? WHERE id = ?')
			.bind(body.area ? JSON.stringify(body.area) : null, id)
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

	await db.prepare('DELETE FROM connections WHERE id = ?').bind(id).run();
	return json({ success: true });
};

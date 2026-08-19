import type { PageServerLoad } from './$types';
import type { Connection } from '$lib/types';
import { env } from '$env/dynamic/private';

function publishingEnabled(): boolean {
	const raw = env.PUBLISH;
	if (raw === undefined) return true; // default: publishing on if unset
	return raw.trim().toLowerCase() === 'true';
}

export const load: PageServerLoad = async ({ fetch }) => {
	const canPublish = publishingEnabled();

	try {
		const res = await fetch('/api/connections');
		if (!res.ok) return { connections: [] as Connection[], canPublish };
		const data = await res.json();
		return {
			connections: Array.isArray(data) ? (data as Connection[]) : [],
			canPublish,
		};
	} catch {
		return { connections: [] as Connection[], canPublish };
	}
};

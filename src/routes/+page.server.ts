import type { PageServerLoad } from './$types';
import type { Connection } from '$lib/types';

export const load: PageServerLoad = async ({ fetch }) => {
	// Degrade gracefully: a failed/empty API response must never crash the page —
	// always hand the store a real array so the list renders (empty if need be).
	try {
		const res = await fetch('/api/connections');
		if (!res.ok) return { connections: [] as Connection[] };
		const data = await res.json();
		return { connections: Array.isArray(data) ? (data as Connection[]) : [] };
	} catch {
		return { connections: [] as Connection[] };
	}
};

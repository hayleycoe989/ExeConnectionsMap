import type { PageServerLoad } from './$types';
import type { Stakeholder } from '$lib/types';

export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch('/api/stakeholders');
	const stakeholders = (await res.json()) as Stakeholder[];
	return { stakeholders };
};

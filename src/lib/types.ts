export const STAKEHOLDER_CATEGORIES = [
	'Environmental',
	'Recreational',
	'Educational',
	'Commercial',
	'Political',
] as const;

export type StakeholderCategory = (typeof STAKEHOLDER_CATEGORIES)[number];

export interface Stakeholder {
	id: string;
	name: string;
	role: string;
	link?: string;
	categories: StakeholderCategory[];
	lsoaCodes: string[];
	createdAt: string;
}

export interface StakeholderFormData {
	name: string;
	role: string;
	link: string;
	categories: StakeholderCategory[];
	disclaimerAccepted: boolean;
}

export interface StakeholderFormErrors {
	name?: string;
	role?: string;
	link?: string;
	categories?: string;
	disclaimer?: string;
}

export interface LsoaClickInfo {
	lsoaCode: string;
	lsoaName: string;
	lngLat: [number, number];
}

export type AppMode =
	| { type: 'idle' }
	| { type: 'form' }
	| { type: 'lsoa-selection'; stakeholderId: string };

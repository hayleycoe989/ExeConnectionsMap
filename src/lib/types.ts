import type { Polygon } from 'geojson';

export const CONNECTION_CATEGORIES = [
	'Environmental',
	'Recreational',
	'Educational',
	'Commercial',
	'Habitat',
] as const;

export type ConnectionCategory = (typeof CONNECTION_CATEGORIES)[number];

export interface Connection {
	id: string;
	name: string;
	role: string;
	link?: string;
	categories: ConnectionCategory[];
	area: Polygon | null;
	createdAt: string;
}

export interface ConnectionFormData {
	name: string;
	role: string;
	link: string;
	categories: ConnectionCategory[];
	disclaimerAccepted: boolean;
}

export interface ConnectionFormErrors {
	name?: string;
	role?: string;
	link?: string;
	categories?: string;
	disclaimer?: string;
}

export interface ConnectionClickInfo {
	connectionId: string;
	lngLat: [number, number];
}

export type AppMode =
	| { type: 'idle' }
	| { type: 'form' }
	| { type: 'draw'; connectionId: string };

// See https://kit.svelte.dev/docs/types#app

interface D1PreparedStatement {
	bind(...values: unknown[]): D1PreparedStatement;
	all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
	run(): Promise<{ success: boolean }>;
	first<T = Record<string, unknown>>(): Promise<T | null>;
}

interface D1Database {
	prepare(query: string): D1PreparedStatement;
	exec(query: string): Promise<{ count: number; duration: number }>;
}

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		interface Platform {
			env?: {
				DB: D1Database;
			};
			context?: { waitUntil(promise: Promise<unknown>): void };
			caches?: CacheStorage & { default: Cache };
		}
	}
}

export {};

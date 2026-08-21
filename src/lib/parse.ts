export const getRecord = (value: unknown): Record<string, unknown> | null =>
	typeof value === "object" && value !== null && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: null;

export const getString = (value: unknown) =>
	typeof value === "string" && value.trim() ? value.trim() : "";

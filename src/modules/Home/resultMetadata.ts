const READINESS_METADATA_KEYS = new Set([
	"aiida_id",
	"calculator",
	"project_name",
	"status",
	"time_concluded",
	"time_queued",
	"time_started",
]);

const DISPLAY_METADATA_KEYS = new Set([
	...READINESS_METADATA_KEYS,
	"calculator_used",
	"concluded_at",
	"created_at",
	"download_link",
	"download_url",
	"message",
	"project",
	"result_download_url",
	"result_file",
	"result_url",
	"started_at",
	"submitted_by",
	"username",
]);

export const normalizeResultKey = (key: string) =>
	key
		.trim()
		.replace(/[-\s]+/g, "_")
		.toLowerCase();

export const isReadinessMetadataKey = (key: string) =>
	READINESS_METADATA_KEYS.has(normalizeResultKey(key));

export const isDisplayMetadataKey = (key: string) =>
	DISPLAY_METADATA_KEYS.has(normalizeResultKey(key));

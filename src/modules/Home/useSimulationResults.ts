import {
	downloadSimulationResultAPI,
	type SimulationResultData,
} from "@/modules/Home/home.api";
import { getSimulationResultFields } from "@/modules/Home/SimUtils";
import type { SimulationSubmission } from "@/modules/Home/useHome";

const RESULT_METADATA_KEYS = new Set([
	"aiida_id",
	"calculator",
	"calculator_used",
	"concluded_at",
	"created_at",
	"download_link",
	"download_url",
	"message",
	"project",
	"project_name",
	"result_download_url",
	"result_file",
	"result_url",
	"started_at",
	"status",
	"submitted_by",
	"time_concluded",
	"time_queued",
	"time_started",
	"username",
]);

const isVisibleResultValue = (value: unknown) =>
	value !== undefined &&
	value !== null &&
	value !== "" &&
	typeof value !== "object";

const normalizeResultKey = (key: string) =>
	key
		.trim()
		.replace(/[-\s]+/g, "_")
		.toLowerCase();

const isSummarizedResultKey = (key: string) => {
	const normalizedKey = normalizeResultKey(key);

	return (
		normalizedKey === "summarized_dict" ||
		normalizedKey === "result_summary" ||
		normalizedKey === "summary"
	);
};

const parseSummarizedResult = (value: unknown): Record<string, unknown> => {
	if (!value) {
		return {};
	}

	if (typeof value === "string") {
		try {
			const parsed = JSON.parse(value);
			return parsed && typeof parsed === "object" && !Array.isArray(parsed)
				? parsed
				: {};
		} catch {
			return {};
		}
	}

	return typeof value === "object" && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: {};
};

const getDisplayResultData = (
	resultData: SimulationSubmission["resultData"],
) => {
	if (!resultData) {
		return null;
	}

	return Object.entries(resultData).reduce<Record<string, unknown>>(
		(displayData, [key, value]) => {
			if (isSummarizedResultKey(key)) {
				for (const [summaryKey, summaryValue] of Object.entries(
					parseSummarizedResult(value),
				)) {
					if (isVisibleResultValue(summaryValue)) {
						displayData[summaryKey] = summaryValue;
					}
				}
			} else {
				displayData[key] = value;
			}

			return displayData;
		},
		{},
	);
};

const formatResultLabel = (key: string) =>
	key
		.replace(/[_-]+/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.replace(/\b\w/g, (character) => character.toUpperCase());

const formatResultValue = (value: unknown) => {
	if (value === undefined || value === null || value === "") {
		return "Pending";
	}

	if (typeof value === "number") {
		return Number.isInteger(value) ? String(value) : value.toPrecision(8);
	}

	return String(value);
};

const formatTimestamp = (value: unknown) => {
	if (typeof value !== "string" && typeof value !== "number") {
		return "";
	}

	const date = new Date(value);

	return Number.isNaN(date.getTime())
		? String(value)
		: new Intl.DateTimeFormat(undefined, {
				dateStyle: "medium",
				timeStyle: "short",
			}).format(date);
};

const getFirstResultValue = (
	resultData: SimulationResultData,
	keys: readonly string[],
) => {
	for (const key of keys) {
		const value = resultData[key];

		if (isVisibleResultValue(value)) {
			return value;
		}
	}

	return undefined;
};

const ESSENTIAL_METADATA_FIELDS = [
	{
		key: "aiida_id",
		label: "Job ID",
		aliases: ["aiida_id"],
		format: formatResultValue,
	},
	{
		key: "time_queued",
		label: "Queued At",
		aliases: ["time_queued", "created_at"],
		format: formatTimestamp,
	},
	{
		key: "time_started",
		label: "Started At",
		aliases: ["time_started", "started_at"],
		format: formatTimestamp,
	},
	{
		key: "time_concluded",
		label: "Completed At",
		aliases: ["time_concluded", "concluded_at"],
		format: formatTimestamp,
	},
] as const;

export const getSimulationMetadataRows = (submission: SimulationSubmission) => {
	const resultData = submission.resultData;

	if (!resultData) {
		return [];
	}

	return ESSENTIAL_METADATA_FIELDS.flatMap(
		({ key, label, aliases, format }) => {
			const value = getFirstResultValue(resultData, aliases);

			if (!isVisibleResultValue(value)) {
				return [];
			}

			const formattedValue = format(value);

			return formattedValue ? [{ key, label, value: formattedValue }] : [];
		},
	);
};

export const getSimulationResultRows = (submission: SimulationSubmission) => {
	const preferredFields = getSimulationResultFields(submission.simulatorLabel);
	const preferredKeys = new Set(preferredFields.map(({ key }) => key));
	const resultData = getDisplayResultData(submission.resultData);
	const preferredRows = preferredFields.map(({ key, label }) => ({
		key,
		label,
		value: formatResultValue(resultData?.[key]),
	}));

	if (!resultData) {
		return preferredRows;
	}

	const hasPreferredValues = preferredFields.some(({ key }) =>
		isVisibleResultValue(resultData[key]),
	);
	const extraRows = Object.entries(resultData).flatMap(([key, value]) => {
		return !preferredKeys.has(key) &&
			!RESULT_METADATA_KEYS.has(normalizeResultKey(key)) &&
			isVisibleResultValue(value)
			? [
					{
						key,
						label: formatResultLabel(key),
						value: formatResultValue(value),
					},
				]
			: [];
	});

	return hasPreferredValues
		? [...preferredRows, ...extraRows]
		: extraRows.length > 0
			? extraRows
			: preferredRows;
};

export const getSummaryResultRows = (summary: unknown) =>
	Object.entries(parseSummarizedResult(summary)).flatMap(([key, value]) =>
		isVisibleResultValue(value)
			? [
					{
						key,
						label: formatResultLabel(key),
						value: formatResultValue(value),
					},
				]
			: [],
	);

export const downloadSimulationResult = async (
	downloadUrl: string,
	fallbackName: string,
) => {
	const { blob, filename } = await downloadSimulationResultAPI(
		downloadUrl,
		fallbackName,
	);
	const objectUrl = URL.createObjectURL(blob);
	const link = document.createElement("a");

	try {
		link.href = objectUrl;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		link.remove();
	} finally {
		URL.revokeObjectURL(objectUrl);
	}
};

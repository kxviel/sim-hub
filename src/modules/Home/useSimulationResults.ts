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
	"status",
	"submitted_by",
	"time_concluded",
	"time_queued",
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

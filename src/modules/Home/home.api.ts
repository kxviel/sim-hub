import { useMutation } from "@tanstack/react-query";
import http, { ApiError } from "@/lib/http";

export type SimulationBody = {
	subtypeSlug: string;
	usernameSlug: string;
	projectName: string;
	formData: FormData;
};

export type SimulationResultData = Record<string, unknown>;

export type SimulationResponse = {
	ready: boolean;
	failed: boolean;
	message: string;
	projectName: string;
	resultData: SimulationResultData | null;
	downloadUrl: string;
};

export type SimulationHistoryItem = {
	projectName: string;
	calculator: string;
	status: string;
	createdAt: string;
	resultSummary: unknown;
};

type ApiResponse = {
	message?: unknown;
	status?: unknown;
	state?: unknown;
	project_name?: unknown;
	projectName?: unknown;
	data?: unknown;
	download_url?: unknown;
	downloadUrl?: unknown;
	download_link?: unknown;
	downloadLink?: unknown;
	result_url?: unknown;
	resultUrl?: unknown;
	result_download_url?: unknown;
	resultDownloadUrl?: unknown;
	submitted?: unknown;
};

const WAITING_STATUSES = new Set([
	"ongoing",
	"pending",
	"queue",
	"queued",
	"running",
	"started",
	"submitted",
	"waiting",
]);
const FAILURE_STATUSES = new Set([
	"canceled",
	"cancelled",
	"error",
	"errored",
	"failed",
	"failure",
]);
const getString = (value: unknown) =>
	typeof value === "string" && value.trim() ? value.trim() : "";

const getRecord = (value: unknown): Record<string, unknown> | null =>
	typeof value === "object" && value !== null && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: null;

const hasResultValues = (resultData: SimulationResultData | null) =>
	Boolean(
		resultData &&
			Object.values(resultData).some(
				(value) => value !== undefined && value !== null && value !== "",
			),
	);

const parseResultData = (value: unknown): SimulationResultData | null => {
	if (typeof value === "string") {
		try {
			const parsed = JSON.parse(value);
			return typeof parsed === "object" && parsed !== null
				? (parsed as SimulationResultData)
				: null;
		} catch {
			return null;
		}
	}

	return typeof value === "object" && value !== null
		? (value as SimulationResultData)
		: null;
};

const getResponseStatus = (
	response: ApiResponse,
	nestedResponse: ApiResponse,
	resultData: SimulationResultData | null,
) => {
	const status =
		response.status ??
		response.state ??
		nestedResponse.status ??
		nestedResponse.state ??
		resultData?.status;

	if (typeof status === "string") {
		return status.trim().toLowerCase();
	}

	return "";
};

const parseSimulationResponse = (
	payload: unknown,
	fallbackProjectName: string,
): SimulationResponse => {
	const response = (payload ?? {}) as ApiResponse;
	const parsedResponseData = parseResultData(response.data);
	const nestedResponse = (parsedResponseData ?? {}) as ApiResponse;
	const resultData = parsedResponseData;
	const responseStatus = getResponseStatus(
		response,
		nestedResponse,
		resultData,
	);
	const failed = FAILURE_STATUSES.has(responseStatus);
	const waiting = WAITING_STATUSES.has(responseStatus);
	const projectNameValue =
		response.project_name ??
		response.projectName ??
		nestedResponse.project_name ??
		nestedResponse.projectName;
	const projectName = Array.isArray(projectNameValue)
		? getString(projectNameValue[0])
		: getString(projectNameValue);
	const downloadUrl = getString(
		response.download_url ??
			response.downloadUrl ??
			response.download_link ??
			response.downloadLink ??
			response.result_url ??
			response.resultUrl ??
			response.result_download_url ??
			response.resultDownloadUrl ??
			nestedResponse.download_url ??
			nestedResponse.downloadUrl ??
			nestedResponse.download_link ??
			nestedResponse.downloadLink,
	);

	return {
		ready: !failed && !waiting && hasResultValues(resultData),
		failed,
		message:
			getString(response.message) ||
			(failed ? getString(resultData?.error) : ""),
		projectName: projectName || fallbackProjectName,
		resultData,
		downloadUrl,
	};
};

export const runSimulationAPI = async (body: SimulationBody) => {
	const { data } = await http.post<unknown>(
		`/run_exec/csv/${body.subtypeSlug}/${body.usernameSlug}`,
		body.formData,
		{ params: { proj_name: body.projectName } },
	);
	const response = (data ?? {}) as ApiResponse;

	if (response.submitted === false) {
		throw new Error(
			getString(response.message) || "The simulation could not be queued.",
		);
	}

	return parseSimulationResponse(data, body.projectName);
};

export const getProjectResultPath = (username: string, projectName: string) =>
	`/proj-data/${encodeURIComponent(username)}/${encodeURIComponent(projectName)}`;

export const getProjectDownloadPath = (username: string, projectName: string) =>
	`${getProjectResultPath(username, projectName)}/download`;

export const getSimulationHistoryAPI = async (username: string) => {
	const { data } = await http.get<unknown>(
		`/${encodeURIComponent(username)}/history`,
	);
	const response = getRecord(data);
	const projects = response?.projects;

	if (!Array.isArray(projects)) {
		return [];
	}

	return projects.flatMap<SimulationHistoryItem>((value) => {
		const project = getRecord(value);
		const projectName = getString(
			project?.project_name ?? project?.projectName,
		);

		if (!project || !projectName) {
			return [];
		}

		return [
			{
				projectName,
				calculator: getString(project.calculator),
				status: getString(project.status),
				createdAt: getString(project.created_at ?? project.createdAt),
				resultSummary: project.result_summary ?? project.resultSummary ?? null,
			},
		];
	});
};

export const getProjectResultAPI = async (
	username: string,
	projectName: string,
) => {
	try {
		const { data } = await http.get<unknown>(
			getProjectResultPath(username, projectName),
		);

		return parseSimulationResponse(data, projectName);
	} catch (error) {
		if (error instanceof ApiError && error.status === 404) {
			return {
				ready: false,
				failed: false,
				message: "Simulation is queued. Waiting for results...",
				projectName,
				resultData: null,
				downloadUrl: "",
			};
		}

		throw error;
	}
};

export const isFatalResultError = (error: unknown) =>
	error instanceof ApiError &&
	Boolean(error.status && error.status >= 400 && error.status < 500);

const getDownloadFilename = (
	contentDisposition: unknown,
	fallbackName: string,
) => {
	const safeFallback = fallbackName.replace(/[<>:"/\\|?*]/g, "_");
	const fallback = safeFallback.toLowerCase().endsWith(".zip")
		? safeFallback
		: `${safeFallback}.zip`;

	if (typeof contentDisposition !== "string") {
		return fallback;
	}

	const encodedFilename = contentDisposition.match(
		/filename\*=UTF-8''([^;]+)/i,
	)?.[1];

	if (encodedFilename) {
		try {
			return decodeURIComponent(encodedFilename).replace(/[<>:"/\\|?*]/g, "_");
		} catch {
			return encodedFilename.replace(/[<>:"/\\|?*]/g, "_");
		}
	}

	return (
		contentDisposition
			.match(/filename="?([^";]+)"?/i)?.[1]
			?.replace(/[<>:"/\\|?*]/g, "_") || fallback
	);
};

export const downloadSimulationResultAPI = async (
	downloadUrl: string,
	fallbackName: string,
) => {
	if (!downloadUrl) {
		throw new Error("A result download is not available.");
	}

	const response = await http.get<Blob>(downloadUrl, {
		responseType: "blob",
	});

	return {
		blob: response.data,
		filename: getDownloadFilename(
			response.headers["content-disposition"],
			fallbackName,
		),
	};
};

export const useSimulation = () =>
	useMutation({
		mutationFn: runSimulationAPI,
	});

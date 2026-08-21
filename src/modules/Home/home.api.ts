import { useMutation } from "@tanstack/react-query";
import http, { ApiError } from "@/lib/http";
import { getRecord, getString } from "@/lib/parse";
import { isReadinessMetadataKey } from "@/modules/Home/resultMetadata";

export type SimulationBody = {
	runEndpoint: SimulationRunEndpoint;
	subtypeSlug: string;
	username: string;
	projectName: string;
	formData: FormData;
};

export type SimulationRunEndpoint = "csv" | "file_only";

export type SimulationResultData = Record<string, unknown>;

export type SimulationResponse = {
	ready: boolean;
	failed: boolean;
	message: string;
	projectName: string;
	resultData: SimulationResultData | null;
	downloadUrl: string;
	status: string;
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
	"created",
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
	"excepted",
	"failed",
	"failed to queue",
	"failure",
	"killed",
	"system exception",
]);
const SUCCESS_STATUSES = new Set([
	"completed",
	"downloaded",
	"finished",
	"success",
	"successful",
]);
export const normalizeSimulationStatus = (value: unknown) =>
	typeof value === "string"
		? value.trim().toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ")
		: "";

const hasResultValues = (resultData: SimulationResultData | null) =>
	Boolean(
		resultData &&
			Object.entries(resultData).some(
				([key, value]) =>
					!isReadinessMetadataKey(key) &&
					value !== undefined &&
					value !== null &&
					value !== "" &&
					value !== "null",
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
	resultData: SimulationResultData | null,
) => {
	const status =
		response.status ??
		response.state ??
		resultData?.status ??
		resultData?.state;

	return normalizeSimulationStatus(status);
};

const getFailureMessage = (resultData: SimulationResultData | null) => {
	const summary = parseResultData(
		resultData?.summarized_dict ??
			resultData?.result_summary ??
			resultData?.summary,
	);

	return (
		getString(resultData?.error_message ?? resultData?.error) ||
		getString(summary?.error_message ?? summary?.error) ||
		"Simulation failed in middle logic or the backend."
	);
};

const getStatusMessage = (
	response: ApiResponse,
	status: string,
	resultData: SimulationResultData | null,
	ready: boolean,
	failed: boolean,
	waiting: boolean,
) => {
	if (failed) {
		return getFailureMessage(resultData);
	}

	if (waiting) {
		if (["ongoing", "running", "started"].includes(status)) {
			return "Simulation is running.";
		}

		if (status === "created") {
			return "Simulation is being prepared.";
		}

		return "Simulation is queued. Waiting for results...";
	}

	if (ready) {
		return "Simulation results are ready.";
	}

	if (status) {
		return `Simulation status: ${status}.`;
	}

	return getString(response.message);
};

const parseSimulationResponse = (
	payload: unknown,
	fallbackProjectName: string,
): SimulationResponse => {
	const response = (payload ?? {}) as ApiResponse;
	const resultData = parseResultData(response.data);
	const responseStatus = getResponseStatus(response, resultData);
	const failed = FAILURE_STATUSES.has(responseStatus);
	const waiting = WAITING_STATUSES.has(responseStatus);
	const ready =
		!failed &&
		!waiting &&
		(SUCCESS_STATUSES.has(responseStatus) ||
			(!responseStatus && hasResultValues(resultData)));
	const projectNameValue =
		response.project_name ??
		response.projectName ??
		resultData?.project_name ??
		resultData?.projectName;
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
			resultData?.download_url ??
			resultData?.downloadUrl ??
			resultData?.download_link ??
			resultData?.downloadLink,
	);

	return {
		ready,
		failed,
		message: getStatusMessage(
			response,
			responseStatus,
			resultData,
			ready,
			failed,
			waiting,
		),
		projectName: projectName || fallbackProjectName,
		resultData,
		downloadUrl,
		status: responseStatus,
	};
};

export const runSimulationAPI = async (body: SimulationBody) => {
	const path = [body.runEndpoint, body.subtypeSlug, body.username]
		.map((segment) => encodeURIComponent(segment))
		.join("/");
	const { data } = await http.post<unknown>(
		`/run_exec/${path}`,
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
				status: "queued",
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

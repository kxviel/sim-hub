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
	message: string;
	projectName: string;
	resultData: SimulationResultData | null;
	downloadUrl: string;
};

type ApiResponse = {
	message?: unknown;
	project_name?: unknown;
	projectName?: unknown;
	data?: unknown;
	download_url?: unknown;
	downloadUrl?: unknown;
	download_link?: unknown;
	downloadLink?: unknown;
};

const RESULT_FIELDS = ["energy", "fermi_energy", "volume", "scf_iterations"];

const getString = (value: unknown) =>
	typeof value === "string" && value.trim() ? value.trim() : "";

const parseResultData = (value: unknown): SimulationResultData | null => {
	if (typeof value === "string") {
		try {
			const parsed = JSON.parse(value);
			return typeof parsed === "object" && parsed !== null ? parsed : null;
		} catch {
			return null;
		}
	}

	return typeof value === "object" && value !== null
		? (value as SimulationResultData)
		: null;
};

const parseSimulationResponse = (
	payload: unknown,
	fallbackProjectName: string,
): SimulationResponse => {
	const response = (payload ?? {}) as ApiResponse;
	const resultData = parseResultData(response.data);
	const projectName = Array.isArray(response.project_name)
		? getString(response.project_name[0])
		: getString(response.project_name ?? response.projectName);
	const downloadUrl = getString(
		response.download_url ??
			response.downloadUrl ??
			response.download_link ??
			response.downloadLink,
	);

	return {
		ready: Boolean(
			resultData && RESULT_FIELDS.some((field) => resultData[field] != null),
		),
		message: getString(response.message),
		projectName: projectName || fallbackProjectName,
		resultData,
		downloadUrl,
	};
};

export const runSimulationAPI = async (body: SimulationBody) => {
	const { data } = await http.post<unknown>(
		`/run_exec/${body.subtypeSlug}/${body.usernameSlug}`,
		body.formData,
		{ params: { proj_name: body.projectName } },
	);

	return parseSimulationResponse(data, body.projectName);
};

export const getProjectResultPath = (username: string, projectName: string) =>
	`/proj-data/${encodeURIComponent(username)}/${encodeURIComponent(projectName)}`;

export const getProjectDownloadPath = (username: string, projectName: string) =>
	`${getProjectResultPath(username, projectName)}/download`;

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

export const resolveDownloadUrl = (downloadUrl: string) => {
	if (/^https?:\/\//i.test(downloadUrl)) {
		return downloadUrl;
	}

	const baseUrl = String(http.defaults.baseURL ?? "").replace(/\/$/, "");
	const path = downloadUrl.startsWith("/") ? downloadUrl : `/${downloadUrl}`;

	return path.startsWith(baseUrl) ? path : `${baseUrl}${path}`;
};

export const useSimulation = () =>
	useMutation({
		mutationFn: runSimulationAPI,
	});

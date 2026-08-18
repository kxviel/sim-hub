import { isTauri } from "@tauri-apps/api/core";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import axios, { type AxiosError } from "axios";

const IS_TAURI_RUNTIME = isTauri();
const DEFAULT_API_URI = IS_TAURI_RUNTIME
	? __TAURI_MIDDLE_LOGIC_URI__
	: import.meta.env.VITE_API_BASE_URI;
const API_URI_STORAGE_KEY = "simulationHub.middleLogicUrl";
const API_TARGET_QUERY_PARAM = "__middle_logic_target";

if (!DEFAULT_API_URI) {
	throw new Error("API base URI is missing.");
}

export const isValidApiBaseUrl = (value: string) =>
	/^https:\/\/[a-z0-9-]+\.ngrok-free\.dev$/i.test(
		value.trim().replace(/\/+$/, ""),
	);

const normalizeApiBaseUrl = (value: string) => value.trim().replace(/\/+$/, "");

export const getApiBaseUrl = () => {
	if (typeof window === "undefined") {
		return DEFAULT_API_URI;
	}

	return getSavedApiTarget() || DEFAULT_API_URI;
};

const getSavedApiTarget = () => {
	if (typeof window === "undefined") {
		return "";
	}

	const savedUrl = window.localStorage.getItem(API_URI_STORAGE_KEY) ?? "";
	return isValidApiBaseUrl(savedUrl) ? normalizeApiBaseUrl(savedUrl) : "";
};

export const saveApiBaseUrl = (value: string) => {
	if (!isValidApiBaseUrl(value)) {
		window.localStorage.removeItem(API_URI_STORAGE_KEY);
		return null;
	}

	const normalizedUrl = normalizeApiBaseUrl(value);
	window.localStorage.setItem(API_URI_STORAGE_KEY, normalizedUrl);
	return normalizedUrl;
};

export const resetApiBaseUrl = () => {
	window.localStorage.removeItem(API_URI_STORAGE_KEY);
	return DEFAULT_API_URI;
};

export class ApiError extends Error {
	constructor(
		message: string,
		readonly status?: number,
	) {
		super(message);
	}
}

type ApiErrorResponse =
	| string
	| {
			detail?: string | { loc?: unknown[]; msg?: string }[];
			message?: string;
	  };

const getValidationErrorMessage = (
	details: { loc?: unknown[]; msg?: string }[],
) =>
	details
		.flatMap((detail) => {
			if (!detail.msg) {
				return [];
			}

			const location = Array.isArray(detail.loc)
				? detail.loc
						.filter((part) => part !== "body")
						.map(String)
						.join(" > ")
				: "";

			return [location ? `${detail.msg}: ${location}` : detail.msg];
		})
		.join("; ");

const getApiErrorMessage = (error: AxiosError<ApiErrorResponse>) => {
	const data = error.response?.data;

	if (typeof data === "string") {
		const normalizedData = data.trim();

		if (
			normalizedData.includes("ERR_NGROK_3200") ||
			normalizedData.includes("ERR_NGROK_6024") ||
			(normalizedData.includes("endpoint") &&
				normalizedData.includes("is offline"))
		) {
			return "Middle-logic service is not returning API JSON. Please ask your teammate to keep ngrok running and allow API requests.";
		}

		if (normalizedData && !/^(?:<!doctype|<html)/i.test(normalizedData)) {
			return normalizedData;
		}

		return error.message;
	}

	if (typeof data?.detail === "string") {
		return data.detail;
	}

	if (Array.isArray(data?.detail)) {
		return getValidationErrorMessage(data.detail) || error.message;
	}

	return data?.message || error.message;
};

const http = axios.create({
	...(IS_TAURI_RUNTIME
		? { adapter: "fetch" as const, env: { fetch: tauriFetch } }
		: {}),
	baseURL: DEFAULT_API_URI,
	headers: {
		"ngrok-skip-browser-warning": "true",
	},
});

http.interceptors.request.use((config) => {
	const savedTarget = getSavedApiTarget();
	const usesLocalProxy = !IS_TAURI_RUNTIME && DEFAULT_API_URI.startsWith("/");
	const usesRelativeUrl = !/^https?:\/\//i.test(config.url ?? "");

	config.baseURL = usesLocalProxy
		? DEFAULT_API_URI
		: savedTarget || DEFAULT_API_URI;

	if (usesLocalProxy && usesRelativeUrl && savedTarget) {
		config.params = {
			...(config.params ?? {}),
			[API_TARGET_QUERY_PARAM]: savedTarget,
		};
	}

	return config;
});

http.interceptors.response.use(
	undefined,
	(error: AxiosError<ApiErrorResponse>) =>
		Promise.reject(
			new ApiError(getApiErrorMessage(error), error.response?.status),
		),
);

export default http;

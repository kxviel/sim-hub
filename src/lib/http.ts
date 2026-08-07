import axios, { type AxiosError } from "axios";

const DEFAULT_API_URI = import.meta.env.VITE_API_BASE_URI;
const API_URI_STORAGE_KEY = "simulationHub.middleLogicUrl";

if (!DEFAULT_API_URI) {
	throw new Error("API base URI is missing.");
}

export const isValidApiBaseUrl = (value: string) =>
	/^https?:\/\//i.test(value.trim());

const normalizeApiBaseUrl = (value: string) => value.trim().replace(/\/+$/, "");

export const getApiBaseUrl = () => {
	if (typeof window === "undefined") {
		return DEFAULT_API_URI;
	}

	const savedUrl = window.localStorage.getItem(API_URI_STORAGE_KEY) ?? "";
	return isValidApiBaseUrl(savedUrl)
		? normalizeApiBaseUrl(savedUrl)
		: DEFAULT_API_URI;
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
	| { detail?: string | { msg?: string }[]; message?: string };

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

	if (Array.isArray(data?.detail) && data.detail[0]?.msg) {
		return data.detail[0].msg;
	}

	return data?.message || error.message;
};

const http = axios.create({
	baseURL: getApiBaseUrl(),
	headers: {
		"ngrok-skip-browser-warning": "true",
	},
});

http.interceptors.request.use((config) => {
	config.baseURL = getApiBaseUrl();
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

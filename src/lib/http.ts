import axios, { type AxiosError } from "axios";

const apiUrl = import.meta.env.VITE_API_BASE_URI;

if (!apiUrl) {
	throw new Error("VITE_API_BASE_URI is missing.");
}

export class ApiError extends Error {
	constructor(
		message: string,
		readonly status?: number,
	) {
		super(message);
	}
}

const http = axios.create({
	baseURL: apiUrl,
	headers: { "ngrok-skip-browser-warning": "true" },
});

http.interceptors.response.use(undefined, (error: AxiosError) => {
	const data = error.response?.data as
		| { detail?: string; message?: string }
		| undefined;

	return Promise.reject(
		new ApiError(
			data?.detail ?? data?.message ?? error.message,
			error.response?.status,
		),
	);
});

export default http;

import axios, { type AxiosError } from "axios";

const API_URI = import.meta.env.VITE_API_BASE_URI;

if (!API_URI) {
	throw new Error("API base URI is missing.");
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
	baseURL: API_URI,
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

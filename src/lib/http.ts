import axios from "axios";
import { toast } from "sonner";
import { router } from "@/main";

const http = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URI,
});

http.interceptors.request.use((req) => {
	// const token = getCookie("quizAdmin");
	const token = "DJKHJKHKJ";
	req.headers.Authorization = token ? `Bearer ${token}` : "";

	return req;
});

http.interceptors.response.use(
	(response) => response,
	(error) => {
		if (401 === error.response.status) {
			localStorage.clear();
			toast.error("Unauthorized, logging out ...");
			router.navigate({ to: "/" });
		} else {
			return Promise.reject(error?.response.data?.message[0]);
		}
	},
);

export default http;

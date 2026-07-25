import { useMutation } from "@tanstack/react-query";
import http from "@/lib/http";

export type SimulationBody = {
	subtypeSlug: string;
	usernameSlug: string;
	formData: FormData;
};

export const runSimulationAPI = async (body: SimulationBody) => {
	return http.post(
		`/run_exec/${body.subtypeSlug}/${body.usernameSlug}`,
		body.formData,
	);
};

export const useSimulation = () =>
	useMutation({
		mutationFn: runSimulationAPI,
	});

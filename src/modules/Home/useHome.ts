import { useState } from "react";
import { toast } from "sonner";
import { getAuthSession } from "@/modules/Auth/auth.session";
import { useSimulation } from "@/modules/Home/home.api";
import {
	getSimulationSubtypeList,
	getSimulatorConfig,
	type SimulatorConfig,
	type SimulatorParameterValue,
} from "@/modules/Home/SimUtils";

export type HomeState = {
	simType: string;
	simSubType: string;
	simulatorConfig?: SimulatorConfig;
	setupComplete: boolean;
	simulationSubtypeList: {
		label: string;
		value: string;
	}[];
	results: string[];
	setResults: React.Dispatch<React.SetStateAction<string[]>>;
	isSubmitting: boolean;
	handleSimulationTypeChange: (value: string | null) => void;
	handleSimulationSubtypeChange: (value: string | null) => void;
	handleParamSubmit: (
		files: File[],
		optionalFiles: File[],
	) => void;
	handleConfiguredSubmit: (
		config: SimulatorConfig,
		parameters: Record<string, SimulatorParameterValue>,
	) => void;
};

export const useHome = (): HomeState => {
	const [simType, setSimType] = useState("");
	const [simSubType, setSimSubType] = useState("");
	const [setupComplete, setSetupComplete] = useState(false);
	const [results, setResults] = useState([""]);

	const runSimulation = useSimulation();

	const simulationSubtypeList = getSimulationSubtypeList(simType);
	const simulatorConfig = getSimulatorConfig(simSubType);

	const handleSimulationTypeChange = (value: string | null) => {
		setSimType(value ?? "");
		setSimSubType("");
	};

	const handleSimulationSubtypeChange = (value: string | null) => {
		setSimSubType(value ?? "");
		setSetupComplete(!!(simType && value));
	};

	const handleAuthError = (error: unknown) => {
		const message =
			error instanceof Error && error.message
				? error.message
				: "Unable to continue.";
		toast.error(message);
	};

	const handleSimulationSuccess = (
		result: Awaited<ReturnType<typeof runSimulation.mutateAsync>>,
		message: string,
	) => {
		console.log(result);
		setResults([message]);
		toast.success(message);
	};

	const submitSimulation = async (
		config: SimulatorConfig,
		formData: FormData,
	) => {
		const username = getAuthSession()?.username ?? "";

		if (!username) {
			toast.error("Sign in before running a simulation.");
			return;
		}

		try {
			const result = await runSimulation.mutateAsync({
				subtypeSlug: config.calculatorSlug,
				usernameSlug: encodeURIComponent(username),
				formData,
			});

			handleSimulationSuccess(result, `${config.label} simulation submitted.`);
			return;
		} catch (error) {
			handleAuthError(error);
		}
	};

	const handleParamSubmit = (files: File[], optionalFiles: File[]) => {
		const config = getSimulatorConfig("Quantum ESPRESSO");
		const formData = new FormData();
		formData.append("proj_name", `${config.projectPrefix}_${Date.now()}`);

		for (const file of files) formData.append("input_file", file);
		for (const file of optionalFiles) formData.append("pseudofiles", file);

		submitSimulation(config, formData);
	};

	const handleConfiguredSubmit = (
		config: SimulatorConfig,
		parameters: Record<string, SimulatorParameterValue>,
	) => {
		const formData = new FormData();
		formData.append("proj_name", `${config.projectPrefix}_${Date.now()}`);
		formData.append("parameters", JSON.stringify(parameters));
		submitSimulation(config, formData);
	};

	return {
		simType,
		simSubType,
		simulatorConfig,
		setupComplete,
		simulationSubtypeList,
		results,
		setResults,
		isSubmitting: runSimulation.isPending,
		handleSimulationTypeChange,
		handleSimulationSubtypeChange,
		handleParamSubmit,
		handleConfiguredSubmit,
	};
};

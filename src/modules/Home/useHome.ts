import { useState } from "react";
import { toast } from "sonner";
import { getAuthSession } from "@/modules/Auth/auth.session";
import { useSimulation } from "@/modules/Home/home.api";
import { getSimulationSubtypeList } from "@/modules/Home/SimUtils";

export type SimulationParameterValue = string | number | boolean | number[];

export type ConfiguredSimulationSubmission = {
	calculatorSlug: string;
	projectPrefix: string;
	simulatorLabel: string;
	parameters?: Record<string, SimulationParameterValue>;
	fileGroups?: {
		fieldName: string;
		files: File[];
	}[];
};

export type HomeState = {
	simType: string;
	simSubType: string;
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
	handleParamSubmit: (files: File[], optionalFiles: File[]) => void;
	handleConfiguredSubmit: (submission: ConfiguredSimulationSubmission) => void;
};

export const useHome = (): HomeState => {
	const [simType, setSimType] = useState("");
	const [simSubType, setSimSubType] = useState("");
	const [setupComplete, setSetupComplete] = useState(false);
	const [results, setResults] = useState([""]);

	const runSimulation = useSimulation();

	const simulationSubtypeList = getSimulationSubtypeList(simType);

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
		config: {
			calculatorSlug: string;
			simulatorLabel: string;
		},
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

			handleSimulationSuccess(
				result,
				`${config.simulatorLabel} simulation submitted.`,
			);
			return;
		} catch (error) {
			handleAuthError(error);
		}
	};

	const handleParamSubmit = (files: File[], optionalFiles: File[]) => {
		const formData = new FormData();
		formData.append("proj_name", `DFT_quantum_espresso_${Date.now()}`);

		for (const file of files) formData.append("input_file", file);
		for (const file of optionalFiles) formData.append("pseudofiles", file);

		submitSimulation(
			{
				calculatorSlug: "Quantum-Espresso",
				simulatorLabel: "Quantum ESPRESSO",
			},
			formData,
		);
	};

	const handleConfiguredSubmit = (
		submission: ConfiguredSimulationSubmission,
	) => {
		const formData = new FormData();
		formData.append("proj_name", `${submission.projectPrefix}_${Date.now()}`);

		if (submission.parameters) {
			formData.append("parameters", JSON.stringify(submission.parameters));
		}

		for (const group of submission.fileGroups ?? []) {
			for (const file of group.files) {
				formData.append(group.fieldName, file);
			}
		}

		submitSimulation(submission, formData);
	};

	return {
		simType,
		simSubType,
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

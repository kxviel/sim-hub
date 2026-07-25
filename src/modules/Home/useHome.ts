import { useState } from "react";
import { toast } from "sonner";
import { useSimulation } from "@/modules/Home/home.api";
import { getSimulationSubtypeList } from "@/modules/Home/SimUtils";

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
	handleSimulationTypeChange: (value: string | null) => void;
	handleSimulationSubtypeChange: (value: string | null) => void;
	handleParamSubmit: (files: File[], optionalfiles: File[]) => void;
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

	const handleAuthSuccess = (
		result: Awaited<ReturnType<typeof runSimulation.mutateAsync>>,
		message: string,
	) => {
		console.log(result);
		toast.success(message);
	};

	const handleParamSubmit = async (files: File[], optionalfiles: File[]) => {
		const QE_PROJECT_NAME = "DFT_quantum_espresso";
		const projectName = `${QE_PROJECT_NAME}_${Date.now()}`;
		const QE_CALCULATOR_SLUG = "Quantum-Espresso";

		const formData = new FormData();
		// formData.append("csv_file", files.parameters);
		// formData.append("structure_file", files.structure);
		formData.append("proj_name", projectName);

		if (optionalfiles.length > 0) {
			optionalfiles.forEach((file) => {
				formData.append("pseudofiles", file);
			});
		}

		try {
			const result = await runSimulation.mutateAsync({
				subtypeSlug: QE_CALCULATOR_SLUG,
				usernameSlug: "",
				formData,
			});

			handleAuthSuccess(result, "Account created.");
			return;
		} catch (error) {
			handleAuthError(error);
		}
	};

	return {
		simType,
		simSubType,
		setupComplete,
		simulationSubtypeList,
		results,
		setResults,
		handleSimulationTypeChange,
		handleSimulationSubtypeChange,
		handleParamSubmit,
	};
};

import { useState } from "react";
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
	handleParamSubmit: () => void;
};

export const useHome = (): HomeState => {
	const [simType, setSimType] = useState("");
	const [simSubType, setSimSubType] = useState("");
	const [setupComplete, setSetupComplete] = useState(false);
	const [results, setResults] = useState([""]);

	const simulationSubtypeList = getSimulationSubtypeList(simType);

	const handleSimulationTypeChange = (value: string | null) => {
		setSimType(value ?? "");
		setSimSubType("");
	};

	const handleSimulationSubtypeChange = (value: string | null) => {
		setSimSubType(value ?? "");
		setSetupComplete(!!(simType && value));
	};

	const handleParamSubmit = () => {};

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

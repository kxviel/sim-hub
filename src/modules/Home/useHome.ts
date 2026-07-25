import { useState } from "react";
import { toast } from "sonner";
import { MAX_FILE_SIZE, SIMULATION_LIST } from "@/modules/Home/SimUtils";

export const infoList = SIMULATION_LIST.map((item) => ({
	type: item.id,
	subtype: item.subtypes[0],
}));

export const simulationTypeList = SIMULATION_LIST.map((sim) => ({
	label: sim.label,
	value: sim.id,
}));

const getSimulationSubtypeList = (simulationType: string) =>
	SIMULATION_LIST.find((sim) => sim.id === simulationType)?.subtypes.map(
		(subtype) => ({ label: subtype, value: subtype }),
	) ?? [];

export type HomeState = {
	simType: string;
	simSubType: string;
	setupComplete: boolean;
	simulationSubtypeList: {
		label: string;
		value: string;
	}[];
	results: string[];
	handleFileChange: (e: React.ChangeEvent<HTMLInputElement, Element>) => void;
	setResults: React.Dispatch<React.SetStateAction<string[]>>;
	handleSimulationTypeChange: (value: string | null) => void;
	handleSimulationSubtypeChange: (value: string | null) => void;
	handleParamSubmit: () => void;
};

export const useHome = (): HomeState => {
	const [quantumExpressoFiles, setQuantumExpressoFiles] = useState<File[]>([]);

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

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;

		if (!files) return;

		for (const file of Array.from(files)) {
			if (file.size > MAX_FILE_SIZE) {
				toast(`${file.name} must be 5 MB or smaller.`);
				e.target.value = "";
				return;
			}
		}

		const fileArray = Array.from(files);
		setQuantumExpressoFiles(fileArray);

		fileArray.forEach((file) => {
			console.log(file.name);
			console.log(file.type);
			console.log(file.size);
		});
	};

	const handleParamSubmit = () => {};

	return {
		simType,
		simSubType,
		setupComplete,
		simulationSubtypeList,
		results,
		setResults,
		handleFileChange,
		handleSimulationTypeChange,
		handleSimulationSubtypeChange,
		handleParamSubmit,
	};
};

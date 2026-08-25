import { type ChangeEvent, useState } from "react";
import { toast } from "sonner";
import {
	extractElementsFromCifFile,
	normalizeCifFile,
} from "@/modules/Home/cifParser";
import { MAX_FILE_SIZE } from "@/modules/Home/SimUtils";
import type { HomeState } from "@/modules/Home/useHome";

type PseudopotentialFilesByElement = Record<string, File | undefined>;
export type QuantumEspressoMode = "basic" | "advanced";

const validateFile = (
	file: File,
	label: string,
	expectedExtension: ".csv" | ".cif" | ".upf",
) => {
	if (!file.name.toLowerCase().endsWith(expectedExtension)) {
		return `${label} must be a ${expectedExtension.toUpperCase()} file.`;
	}

	if (file.size > MAX_FILE_SIZE) {
		return `${label} must be 5 MB or smaller.`;
	}

	return "";
};

export const useQuantumExpresso = (
	handleConfiguredSubmit: HomeState["handleConfiguredSubmit"],
) => {
	const [parameterFile, setParameterFile] = useState<File | null>(null);
	const [structureFile, setStructureFile] = useState<File | null>(null);
	const [structureElements, setStructureElements] = useState<string[]>([]);
	const [structureWarning, setStructureWarning] = useState("");
	const [pseudopotentialFiles, setPseudopotentialFiles] =
		useState<PseudopotentialFilesByElement>({});
	const [mode, setMode] = useState<QuantumEspressoMode>("basic");

	const handleParameterFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];

		if (!file) return;

		const error = validateFile(file, "CSV parameter file", ".csv");

		if (error) {
			toast.error(error);
			event.target.value = "";
			return;
		}

		setParameterFile(file);
	};

	const handleStructureFileChange = async (
		event: ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];

		if (!file) return;

		const error = validateFile(file, "CIF structure file", ".cif");

		if (error) {
			toast.error(error);
			event.target.value = "";
			return;
		}

		setStructureFile(file);
		setStructureElements([]);
		setStructureWarning("");
		setPseudopotentialFiles({});

		try {
			const parseResult = await extractElementsFromCifFile(file);
			setStructureElements(parseResult.elements);
			setStructureWarning(parseResult.warning);

			if (parseResult.elements.length === 0) {
				toast.error(parseResult.warning);
			}
		} catch {
			const message =
				"Could not read this CIF file. Upload a valid text CIF file.";
			setStructureWarning(message);
			toast.error(message);
		}

		event.target.value = "";
	};

	const handlePseudopotentialFileChange = (
		element: string,
		event: ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];

		if (!file) return;

		const error = validateFile(file, `${element} pseudopotential`, ".upf");

		if (error) {
			toast.error(error);
			event.target.value = "";
			return;
		}

		setPseudopotentialFiles((currentFiles) => ({
			...currentFiles,
			[element]: file,
		}));
		event.target.value = "";
	};

	const handleRemoveRequiredFile = (fileId: "parameters" | "structure") => {
		if (fileId === "parameters") {
			setParameterFile(null);
			return;
		}

		setStructureFile(null);
		setStructureElements([]);
		setStructureWarning("");
		setPseudopotentialFiles({});
	};

	const handleRemovePseudopotentialFile = (element: string) => {
		setPseudopotentialFiles((currentFiles) => {
			const nextFiles = { ...currentFiles };
			delete nextFiles[element];
			return nextFiles;
		});
	};

	const handleRunSimulation = async () => {
		if (!parameterFile) {
			toast.error("Upload the Quantum ESPRESSO CSV parameter file.");
			return;
		}

		if (!structureFile) {
			toast.error("Upload the material structure as a CIF file.");
			return;
		}

		if (structureElements.length === 0) {
			toast.error(
				structureWarning ||
					"No chemical elements were detected in the CIF file.",
			);
			return;
		}

		const isAdvanced = mode === "advanced";
		const uploadedPseudopotentials = isAdvanced
			? structureElements
					.map((element) => pseudopotentialFiles[element])
					.filter((file): file is File => Boolean(file))
			: [];

		if (
			isAdvanced &&
			uploadedPseudopotentials.length > 0 &&
			uploadedPseudopotentials.length < structureElements.length
		) {
			const missingElements = structureElements.filter(
				(element) => !pseudopotentialFiles[element],
			);
			toast.error(
				`Upload a UPF file for ${missingElements.join(", ")}, or remove all UPF files.`,
			);
			return;
		}

		const normalizedStructureFile = await normalizeCifFile(structureFile);
		const pseudopotentialMapping = structureElements.reduce<
			Record<string, string>
		>((mapping, element) => {
			const filename = isAdvanced
				? pseudopotentialFiles[element]?.name
				: undefined;

			if (filename) {
				mapping[element] = filename;
			}

			return mapping;
		}, {});
		const serializedMapping = JSON.stringify(pseudopotentialMapping);

		handleConfiguredSubmit({
			calculatorSlug: "Quantum-Espresso",
			extraInputs: {
				is_advanced: isAdvanced,
				pseudo_file_mapping: pseudopotentialMapping,
				pseudo_mapping: pseudopotentialMapping,
			},
			projectPrefix: "DFT_quantum_espresso",
			simulatorLabel: "Quantum ESPRESSO",
			...(isAdvanced
				? {
						formFields: {
							pseudo_file_mapping: serializedMapping,
							pseudo_mapping: serializedMapping,
						},
					}
				: {}),
			fileGroups: [
				{ fieldName: "csv_file", files: [parameterFile] },
				{ fieldName: "structure_file", files: [normalizedStructureFile] },
				{ fieldName: "pseudofiles", files: uploadedPseudopotentials },
			],
		});
	};

	const requiredFiles = [
		{ id: "parameters" as const, label: "CSV parameters", file: parameterFile },
		{ id: "structure" as const, label: "CIF structure", file: structureFile },
	].filter(
		(
			item,
		): item is {
			id: "parameters" | "structure";
			label: string;
			file: File;
		} => item.file !== null,
	);

	return {
		handleModeChange: setMode,
		handleParameterFileChange,
		handlePseudopotentialFileChange,
		handleRemovePseudopotentialFile,
		handleRemoveRequiredFile,
		handleRunSimulation,
		handleStructureFileChange,
		mode,
		parameterFile,
		pseudopotentialFiles,
		requiredFiles,
		structureElements,
		structureFile,
		structureWarning,
	};
};

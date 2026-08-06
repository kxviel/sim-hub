import { type ChangeEvent, useState } from "react";
import { toast } from "sonner";
import {
	extractElementsFromCifFile,
	normalizeCifFile,
} from "@/modules/Home/cifParser";
import { MAX_FILE_SIZE } from "@/modules/Home/SimUtils";
import type { HomeState } from "@/modules/Home/useHome";

const API_TEMPLATE = {
	calculatorSlug: "BigDFT",
	projectPrefix: "DFT_bigdft",
	simulatorLabel: "BigDFT",
	parameterFileField: "csv_file",
	structureFileField: "structure_file",
	pseudopotentialFileField: "pseudofiles",
} as const;

type PseudopotentialFilesByElement = Record<string, File | undefined>;
export type BigDftMode = "basic" | "advanced";

const validateRequiredFile = (
	file: File,
	label: string,
	expectedExtension: ".csv" | ".cif",
) => {
	if (!file.name.toLowerCase().endsWith(expectedExtension)) {
		return `${label} must be a ${expectedExtension.toUpperCase()} file.`;
	}

	if (file.size > MAX_FILE_SIZE) {
		return `${label} must be 5 MB or smaller.`;
	}

	return "";
};

export const useBigDFT = (
	handleConfiguredSubmit: HomeState["handleConfiguredSubmit"],
) => {
	const [parameterFile, setParameterFile] = useState<File | null>(null);
	const [structureFile, setStructureFile] = useState<File | null>(null);
	const [structureElements, setStructureElements] = useState<string[]>([]);
	const [structureWarning, setStructureWarning] = useState("");
	const [mode, setMode] = useState<BigDftMode>("basic");
	const [pseudopotentialFiles, setPseudopotentialFiles] =
		useState<PseudopotentialFilesByElement>({});

	const handleParameterFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];

		if (!file) {
			return;
		}

		const error = validateRequiredFile(file, "BigDFT parameter file", ".csv");

		if (error) {
			toast.error(error);
			event.target.value = "";
			return;
		}

		setParameterFile(file);
		event.target.value = "";
	};

	const handleStructureFileChange = async (
		event: ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];

		if (!file) {
			return;
		}

		const error = validateRequiredFile(file, "BigDFT structure file", ".cif");

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

		if (!file) {
			return;
		}

		if (file.size > MAX_FILE_SIZE) {
			toast.error(`${element} pseudopotential must be 5 MB or smaller.`);
			event.target.value = "";
			return;
		}

		setPseudopotentialFiles((currentFiles) => ({
			...currentFiles,
			[element]: file,
		}));
		event.target.value = "";
	};

	const removeParameterFile = () => {
		setParameterFile(null);
	};

	const removeStructureFile = () => {
		setStructureFile(null);
		setStructureElements([]);
		setStructureWarning("");
		setPseudopotentialFiles({});
	};

	const removePseudopotentialFile = (element: string) => {
		setPseudopotentialFiles((currentFiles) => {
			const nextFiles = { ...currentFiles };
			delete nextFiles[element];
			return nextFiles;
		});
	};

	const handleModeChange = (nextMode: BigDftMode) => {
		setMode(nextMode);
	};

	const handleRunSimulation = async () => {
		if (!parameterFile) {
			toast.error("Upload the BigDFT CSV parameter file.");
			return;
		}

		if (!structureFile) {
			toast.error("Upload the BigDFT material structure as a CIF file.");
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
			uploadedPseudopotentials.length < structureElements.length
		) {
			const missingElements = structureElements.filter(
				(element) => !pseudopotentialFiles[element],
			);
			toast.error(
				`Upload a pseudopotential for every detected element. Missing: ${missingElements.join(", ")}.`,
			);
			return;
		}

		const normalizedStructureFile = await normalizeCifFile(structureFile);
		const pseudopotentialMapping = isAdvanced
			? structureElements.reduce<Record<string, string>>((mapping, element) => {
					const filename = pseudopotentialFiles[element]?.name;

					if (filename) {
						mapping[element] = filename;
					}

					return mapping;
				}, {})
			: {};
		const serializedMapping = JSON.stringify(pseudopotentialMapping);

		handleConfiguredSubmit({
			...API_TEMPLATE,
			extraInputs: {
				is_advanced: isAdvanced,
				pseudo_file_mapping: pseudopotentialMapping,
			},
			...(isAdvanced
				? {
						formFields: {
							pseudo_file_mapping: serializedMapping,
							pseudo_mapping: serializedMapping,
						},
					}
				: {}),
			fileGroups: [
				{
					fieldName: API_TEMPLATE.parameterFileField,
					files: [parameterFile],
				},
				{
					fieldName: API_TEMPLATE.structureFileField,
					files: [normalizedStructureFile],
				},
				{
					fieldName: API_TEMPLATE.pseudopotentialFileField,
					files: uploadedPseudopotentials,
				},
			],
		});
	};

	return {
		handleModeChange,
		handleParameterFileChange,
		handlePseudopotentialFileChange,
		handleRunSimulation,
		handleStructureFileChange,
		mode,
		parameterFile,
		pseudopotentialFiles,
		removeParameterFile,
		removePseudopotentialFile,
		removeStructureFile,
		structureElements,
		structureFile,
		structureWarning,
	};
};

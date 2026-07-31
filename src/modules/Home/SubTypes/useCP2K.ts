import { type ChangeEvent, useState } from "react";
import { toast } from "sonner";
import {
	extractElementsFromCifFile,
	normalizeCifFile,
} from "@/modules/Home/cifParser";
import { MAX_FILE_SIZE } from "@/modules/Home/SimUtils";
import type { HomeState } from "@/modules/Home/useHome";

const API_TEMPLATE = {
	calculatorSlug: "CP2K",
	projectPrefix: "DFT_cp2k",
	simulatorLabel: "CP2K",
	parameterFileField: "csv_file",
	structureFileField: "structure_file",
	pseudopotentialFileField: "pseudofiles",
	basisFileField: "basis_files",
} as const;

type ElementFiles = Record<string, File | undefined>;
type SupportFileKind = "pseudopotential" | "basis set";

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

const validateSupportFile = (file: File, label: string) =>
	file.size > MAX_FILE_SIZE ? `${label} must be 5 MB or smaller.` : "";

export const useCP2K = (
	handleConfiguredSubmit: HomeState["handleConfiguredSubmit"],
) => {
	const [parameterFile, setParameterFile] = useState<File | null>(null);
	const [structureFile, setStructureFile] = useState<File | null>(null);
	const [structureElements, setStructureElements] = useState<string[]>([]);
	const [structureWarning, setStructureWarning] = useState("");
	const [pseudopotentialFiles, setPseudopotentialFiles] =
		useState<ElementFiles>({});
	const [basisFiles, setBasisFiles] = useState<ElementFiles>({});

	const handleParameterFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];

		if (!file) {
			return;
		}

		const error = validateRequiredFile(file, "CP2K parameter file", ".csv");

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

		const error = validateRequiredFile(file, "CP2K structure file", ".cif");

		if (error) {
			toast.error(error);
			event.target.value = "";
			return;
		}

		setStructureFile(file);
		setStructureElements([]);
		setStructureWarning("");
		setPseudopotentialFiles({});
		setBasisFiles({});

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

	const handleSupportFileChange = (
		element: string,
		kind: SupportFileKind,
		event: ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];

		if (!file) {
			return;
		}

		const error = validateSupportFile(file, `${element} ${kind} file`);

		if (error) {
			toast.error(error);
			event.target.value = "";
			return;
		}

		const setFiles =
			kind === "pseudopotential" ? setPseudopotentialFiles : setBasisFiles;
		setFiles((currentFiles) => ({
			...currentFiles,
			[element]: file,
		}));
		event.target.value = "";
	};

	const removeSupportFile = (element: string, kind: SupportFileKind) => {
		const setFiles =
			kind === "pseudopotential" ? setPseudopotentialFiles : setBasisFiles;
		setFiles((currentFiles) => {
			const nextFiles = { ...currentFiles };
			delete nextFiles[element];
			return nextFiles;
		});
	};

	const handlePseudopotentialFileChange = (
		element: string,
		event: ChangeEvent<HTMLInputElement>,
	) => {
		handleSupportFileChange(element, "pseudopotential", event);
	};

	const handleBasisFileChange = (
		element: string,
		event: ChangeEvent<HTMLInputElement>,
	) => {
		handleSupportFileChange(element, "basis set", event);
	};

	const removePseudopotentialFile = (element: string) => {
		removeSupportFile(element, "pseudopotential");
	};

	const removeBasisFile = (element: string) => {
		removeSupportFile(element, "basis set");
	};

	const removeParameterFile = () => {
		setParameterFile(null);
	};

	const removeStructureFile = () => {
		setStructureFile(null);
		setStructureElements([]);
		setStructureWarning("");
		setPseudopotentialFiles({});
		setBasisFiles({});
	};

	const handleRunSimulation = async () => {
		if (!parameterFile) {
			toast.error("Upload the CP2K CSV parameter file.");
			return;
		}

		if (!structureFile) {
			toast.error("Upload the CP2K material structure as a CIF file.");
			return;
		}

		if (structureElements.length === 0) {
			toast.error(
				structureWarning ||
					"No chemical elements were detected in the CIF file.",
			);
			return;
		}

		const selectedPseudopotentials = structureElements
			.map((element) => pseudopotentialFiles[element])
			.filter((file): file is File => Boolean(file));
		const selectedBasisFiles = structureElements
			.map((element) => basisFiles[element])
			.filter((file): file is File => Boolean(file));
		const hasSupportFiles =
			selectedPseudopotentials.length > 0 || selectedBasisFiles.length > 0;

		if (hasSupportFiles) {
			const missingFiles = structureElements.flatMap((element) => {
				const missing: string[] = [];

				if (!pseudopotentialFiles[element]) {
					missing.push(`${element} pseudopotential`);
				}

				if (!basisFiles[element]) {
					missing.push(`${element} basis set`);
				}

				return missing;
			});

			if (missingFiles.length > 0) {
				toast.error(
					`Complete every pseudo/basis pair or remove all support files. Missing: ${missingFiles.join(", ")}.`,
				);
				return;
			}
		}

		const normalizedStructureFile = await normalizeCifFile(structureFile);
		handleConfiguredSubmit({
			...API_TEMPLATE,
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
					files: selectedPseudopotentials,
				},
				{
					fieldName: API_TEMPLATE.basisFileField,
					files: selectedBasisFiles,
				},
			],
		});
	};

	return {
		basisFiles,
		handleBasisFileChange,
		handleParameterFileChange,
		handlePseudopotentialFileChange,
		handleRunSimulation,
		handleStructureFileChange,
		parameterFile,
		pseudopotentialFiles,
		removeBasisFile,
		removeParameterFile,
		removePseudopotentialFile,
		removeStructureFile,
		structureElements,
		structureFile,
		structureWarning,
	};
};

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
	pseudopotentialNamesField: "pseudo_names",
	basisNamesField: "basis_names",
} as const;

type ElementNames = Record<string, string | undefined>;
type AdvancedErrors = Record<string, string | undefined>;

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

const cleanElementNames = (names: ElementNames, elements: string[]) =>
	elements.reduce<Record<string, string>>((cleanNames, element) => {
		const name = names[element]?.trim();

		if (name) {
			cleanNames[element] = name;
		}

		return cleanNames;
	}, {});

export const useCP2K = (
	handleConfiguredSubmit: HomeState["handleConfiguredSubmit"],
) => {
	const [parameterFile, setParameterFile] = useState<File | null>(null);
	const [structureFile, setStructureFile] = useState<File | null>(null);
	const [structureElements, setStructureElements] = useState<string[]>([]);
	const [structureWarning, setStructureWarning] = useState("");
	const [advancedOpen, setAdvancedOpen] = useState(false);
	const [pseudopotentialFile, setPseudopotentialFile] = useState<File | null>(
		null,
	);
	const [basisFile, setBasisFile] = useState<File | null>(null);
	const [pseudopotentialNames, setPseudopotentialNames] =
		useState<ElementNames>({});
	const [basisNames, setBasisNames] = useState<ElementNames>({});
	const [advancedErrors, setAdvancedErrors] = useState<AdvancedErrors>({});

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
		setPseudopotentialFile(null);
		setBasisFile(null);
		setPseudopotentialNames({});
		setBasisNames({});
		setAdvancedErrors({});

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
		kind: "pseudopotential" | "basis set",
		event: ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];

		if (!file) {
			return;
		}

		const errorKey =
			kind === "pseudopotential" ? "pseudopotentialFile" : "basisFile";
		const error = validateSupportFile(file, `CP2K ${kind} file`);

		if (error) {
			setAdvancedErrors((currentErrors) => ({
				...currentErrors,
				[errorKey]: error,
			}));
			toast.error(error);
			event.target.value = "";
			return;
		}

		if (kind === "pseudopotential") {
			setPseudopotentialFile(file);
		} else {
			setBasisFile(file);
		}

		setAdvancedErrors((currentErrors) => ({
			...currentErrors,
			[errorKey]: undefined,
			summary: undefined,
		}));
		event.target.value = "";
	};

	const handlePseudopotentialFileChange = (
		event: ChangeEvent<HTMLInputElement>,
	) => {
		handleSupportFileChange("pseudopotential", event);
	};

	const handleBasisFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		handleSupportFileChange("basis set", event);
	};

	const handleElementNameChange = (
		kind: "pseudo" | "basis",
		element: string,
		event: ChangeEvent<HTMLInputElement>,
	) => {
		const setNames =
			kind === "pseudo" ? setPseudopotentialNames : setBasisNames;
		setNames((currentNames) => ({
			...currentNames,
			[element]: event.target.value,
		}));
		setAdvancedErrors((currentErrors) => ({
			...currentErrors,
			[`${kind}:${element}`]: undefined,
			summary: undefined,
		}));
	};

	const handlePseudopotentialNameChange = (
		element: string,
		event: ChangeEvent<HTMLInputElement>,
	) => {
		handleElementNameChange("pseudo", element, event);
	};

	const handleBasisNameChange = (
		element: string,
		event: ChangeEvent<HTMLInputElement>,
	) => {
		handleElementNameChange("basis", element, event);
	};

	const removePseudopotentialFile = () => {
		setPseudopotentialFile(null);
	};

	const removeBasisFile = () => {
		setBasisFile(null);
	};

	const removeParameterFile = () => {
		setParameterFile(null);
	};

	const removeStructureFile = () => {
		setStructureFile(null);
		setStructureElements([]);
		setStructureWarning("");
		setPseudopotentialFile(null);
		setBasisFile(null);
		setPseudopotentialNames({});
		setBasisNames({});
		setAdvancedErrors({});
	};

	const toggleAdvanced = () => {
		setAdvancedOpen((isOpen) => !isOpen);
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

		const hasAdvancedInput =
			Boolean(pseudopotentialFile || basisFile) ||
			structureElements.some(
				(element) =>
					Boolean(pseudopotentialNames[element]?.trim()) ||
					Boolean(basisNames[element]?.trim()),
			);
		const nextAdvancedErrors: AdvancedErrors = {};

		if (hasAdvancedInput) {
			if (!pseudopotentialFile) {
				nextAdvancedErrors.pseudopotentialFile =
					"Upload the shared CP2K pseudopotential file.";
			}

			if (!basisFile) {
				nextAdvancedErrors.basisFile = "Upload the shared CP2K basis-set file.";
			}

			for (const element of structureElements) {
				if (!pseudopotentialNames[element]?.trim()) {
					nextAdvancedErrors[`pseudo:${element}`] =
						`Enter the pseudopotential entry for ${element}.`;
				}

				if (!basisNames[element]?.trim()) {
					nextAdvancedErrors[`basis:${element}`] =
						`Enter the basis-set entry for ${element}.`;
				}
			}

			if (Object.keys(nextAdvancedErrors).length > 0) {
				nextAdvancedErrors.summary =
					"Complete every advanced CP2K field, or remove all advanced inputs.";
			}
		}

		setAdvancedErrors(nextAdvancedErrors);

		if (Object.keys(nextAdvancedErrors).length > 0) {
			setAdvancedOpen(true);
			toast.error(nextAdvancedErrors.summary);
			return;
		}

		const normalizedStructureFile = await normalizeCifFile(structureFile);
		handleConfiguredSubmit({
			...API_TEMPLATE,
			formFields: {
				[API_TEMPLATE.pseudopotentialNamesField]: JSON.stringify(
					cleanElementNames(pseudopotentialNames, structureElements),
				),
				[API_TEMPLATE.basisNamesField]: JSON.stringify(
					cleanElementNames(basisNames, structureElements),
				),
			},
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
					files: pseudopotentialFile ? [pseudopotentialFile] : [],
				},
				{
					fieldName: API_TEMPLATE.basisFileField,
					files: basisFile ? [basisFile] : [],
				},
			],
		});
	};

	return {
		advancedErrors,
		advancedOpen,
		basisFile,
		basisNames,
		handleBasisFileChange,
		handleBasisNameChange,
		handleParameterFileChange,
		handlePseudopotentialFileChange,
		handlePseudopotentialNameChange,
		handleRunSimulation,
		handleStructureFileChange,
		parameterFile,
		pseudopotentialFile,
		pseudopotentialNames,
		removeBasisFile,
		removeParameterFile,
		removePseudopotentialFile,
		removeStructureFile,
		structureElements,
		structureFile,
		structureWarning,
		toggleAdvanced,
	};
};

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
	modeField: "cp2k_mode",
	xcFunctionalField: "xc_functional",
	pseudopotentialNamesField: "pseudo_names",
	basisNamesField: "basis_names",
} as const;

export const CP2K_PSEUDOPOTENTIAL_OPTIONS = [
	{ value: "GTH-PBE", label: "PBE (GTH-PBE)" },
	{ value: "GTH-BLYP", label: "BLYP (GTH-BLYP)" },
	{ value: "GTH-BP", label: "BP (GTH-BP)" },
	{ value: "GTH-PADE", label: "PADE (GTH-PADE)" },
];

export const CP2K_BASIS_SET_OPTIONS = [
	{ value: "SZV-GTH", label: "SZV-GTH — Single-Zeta Valence" },
	{
		value: "DZVP-GTH",
		label: "DZVP-GTH — Double-Zeta Valence with Polarization",
	},
	{
		value: "TZVP-GTH",
		label: "TZVP-GTH — Triple-Zeta Valence with Polarization",
	},
	{
		value: "TZV2P-GTH",
		label: "TZV2P-GTH — Triple-Zeta Valence with Double Polarization",
	},
	{
		value: "aug-DZVP-GTH",
		label: "aug-DZVP-GTH — Augmented Double-Zeta",
	},
	{
		value: "aug-TZVP-GTH",
		label: "aug-TZVP-GTH — Augmented Triple-Zeta",
	},
];

export const CP2K_XC_FUNCTIONAL_OPTIONS = [
	{ value: "PBE", label: "PBE" },
	{ value: "BLYP", label: "BLYP" },
	{ value: "BP", label: "BP" },
	{ value: "PADE", label: "PADE" },
	{ value: "LDA", label: "LDA" },
	{ value: "OLYP", label: "OLYP" },
	{ value: "HCTH120", label: "HCTH120" },
];

export type Cp2kMode = "basic" | "advanced";

type ElementNames = Record<string, string | undefined>;
type Cp2kErrors = Record<string, string | undefined>;

const DEFAULT_BASIC_PSEUDOPOTENTIAL = "GTH-PBE";
const DEFAULT_BASIC_BASIS_SET = "DZVP-GTH";

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

const createElementValueMap = (elements: string[], value: string) =>
	elements.reduce<Record<string, string>>((values, element) => {
		values[element] = value;
		return values;
	}, {});

export const useCP2K = (
	handleConfiguredSubmit: HomeState["handleConfiguredSubmit"],
) => {
	const [parameterFile, setParameterFile] = useState<File | null>(null);
	const [structureFile, setStructureFile] = useState<File | null>(null);
	const [structureElements, setStructureElements] = useState<string[]>([]);
	const [structureWarning, setStructureWarning] = useState("");
	const [mode, setMode] = useState<Cp2kMode>("basic");
	const [basicPseudopotential, setBasicPseudopotential] = useState<string>(
		DEFAULT_BASIC_PSEUDOPOTENTIAL,
	);
	const [basicBasisSet, setBasicBasisSet] = useState<string>(
		DEFAULT_BASIC_BASIS_SET,
	);
	const [pseudopotentialFile, setPseudopotentialFile] = useState<File | null>(
		null,
	);
	const [basisFile, setBasisFile] = useState<File | null>(null);
	const [xcFunctional, setXcFunctional] = useState("");
	const [pseudopotentialNames, setPseudopotentialNames] =
		useState<ElementNames>({});
	const [basisNames, setBasisNames] = useState<ElementNames>({});
	const [errors, setErrors] = useState<Cp2kErrors>({});

	const clearError = (key: string) => {
		setErrors((currentErrors) => ({
			...currentErrors,
			[key]: undefined,
			summary: undefined,
		}));
	};

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
		setXcFunctional("");
		setPseudopotentialNames({});
		setBasisNames({});
		setErrors({});

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
			setErrors((currentErrors) => ({
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

		clearError(errorKey);
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
		clearError(`${kind}:${element}`);
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

	const handleModeChange = (nextMode: Cp2kMode) => {
		setMode(nextMode);
		setErrors({});
	};

	const handleBasicPseudopotentialChange = (value: string | null) => {
		setBasicPseudopotential(value ?? "");
		clearError("basicPseudopotential");
	};

	const handleBasicBasisSetChange = (value: string | null) => {
		setBasicBasisSet(value ?? "");
		clearError("basicBasisSet");
	};

	const handleXcFunctionalChange = (value: string | null) => {
		setXcFunctional(value ?? "");
		clearError("xcFunctional");
	};

	const removePseudopotentialFile = () => {
		setPseudopotentialFile(null);
		clearError("pseudopotentialFile");
	};

	const removeBasisFile = () => {
		setBasisFile(null);
		clearError("basisFile");
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
		setXcFunctional("");
		setPseudopotentialNames({});
		setBasisNames({});
		setErrors({});
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

		const nextErrors: Cp2kErrors = {};

		if (mode === "basic") {
			if (!basicPseudopotential) {
				nextErrors.basicPseudopotential = "Choose a CP2K pseudopotential.";
			}

			if (!basicBasisSet) {
				nextErrors.basicBasisSet = "Choose a CP2K basis set.";
			}
		} else {
			if (!pseudopotentialFile) {
				nextErrors.pseudopotentialFile =
					"Upload the shared CP2K pseudopotential file.";
			}

			if (!basisFile) {
				nextErrors.basisFile = "Upload the shared CP2K basis-set file.";
			}

			if (!xcFunctional) {
				nextErrors.xcFunctional = "Choose an XC functional.";
			}

			for (const element of structureElements) {
				if (!pseudopotentialNames[element]?.trim()) {
					nextErrors[`pseudo:${element}`] =
						`Enter the pseudopotential entry for ${element}.`;
				}

				if (!basisNames[element]?.trim()) {
					nextErrors[`basis:${element}`] =
						`Enter the basis-set entry for ${element}.`;
				}
			}
		}

		if (Object.keys(nextErrors).length > 0) {
			nextErrors.summary = `Complete every ${mode} CP2K field before running the simulation.`;
			setErrors(nextErrors);
			toast.error(nextErrors.summary);
			return;
		}

		setErrors({});
		const normalizedStructureFile = await normalizeCifFile(structureFile);
		const isAdvanced = mode === "advanced";
		const pseudopotentialMap = isAdvanced
			? cleanElementNames(pseudopotentialNames, structureElements)
			: createElementValueMap(structureElements, basicPseudopotential);
		const basisMap = isAdvanced
			? cleanElementNames(basisNames, structureElements)
			: createElementValueMap(structureElements, basicBasisSet);

		handleConfiguredSubmit({
			...API_TEMPLATE,
			formFields: {
				[API_TEMPLATE.modeField]: mode,
				...(isAdvanced
					? { [API_TEMPLATE.xcFunctionalField]: xcFunctional }
					: {}),
				[API_TEMPLATE.pseudopotentialNamesField]:
					JSON.stringify(pseudopotentialMap),
				[API_TEMPLATE.basisNamesField]: JSON.stringify(basisMap),
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
					files: isAdvanced && pseudopotentialFile ? [pseudopotentialFile] : [],
				},
				{
					fieldName: API_TEMPLATE.basisFileField,
					files: isAdvanced && basisFile ? [basisFile] : [],
				},
			],
		});
	};

	return {
		basicBasisSet,
		basicPseudopotential,
		basisFile,
		basisNames,
		errors,
		handleBasicBasisSetChange,
		handleBasicPseudopotentialChange,
		handleBasisFileChange,
		handleBasisNameChange,
		handleModeChange,
		handleParameterFileChange,
		handlePseudopotentialFileChange,
		handlePseudopotentialNameChange,
		handleRunSimulation,
		handleStructureFileChange,
		handleXcFunctionalChange,
		mode,
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
		xcFunctional,
	};
};

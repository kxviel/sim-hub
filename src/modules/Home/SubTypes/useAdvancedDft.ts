import { type ChangeEvent, useState } from "react";
import { toast } from "sonner";
import {
	extractElementsFromCifFile,
	normalizeCifFile,
} from "@/modules/Home/cifParser";
import { MAX_FILE_SIZE } from "@/modules/Home/SimUtils";
import type { HomeState } from "@/modules/Home/useHome";

export type AdvancedDftMode = "basic" | "advanced";
export type AdvancedDftSimulator =
	| "BigDFT"
	| "Siesta"
	| "Octopus"
	| "GPAW"
	| "Exciting"
	| "Fleur";

type PseudopotentialFilesByElement = Record<string, File | undefined>;
type ElementTextValues = Record<string, string | undefined>;

const SIMULATOR_CONFIG = {
	BigDFT: {
		projectPrefix: "DFT_bigdft",
		pseudoExtensions: [],
	},
	Siesta: {
		projectPrefix: "DFT_siesta",
		pseudoExtensions: [".psf", ".psml"],
	},
	Octopus: {
		projectPrefix: "DFT_octopus",
		pseudoExtensions: [".upf", ".psf"],
	},
	GPAW: {
		projectPrefix: "DFT_gpaw",
		pseudoExtensions: [],
	},
	Exciting: {
		projectPrefix: "DFT_exciting",
		pseudoExtensions: [],
	},
	Fleur: {
		projectPrefix: "DFT_fleur",
		pseudoExtensions: [],
	},
} as const satisfies Record<
	AdvancedDftSimulator,
	{ projectPrefix: string; pseudoExtensions: readonly string[] }
>;

export const SIESTA_XC_FUNCTIONAL_OPTIONS = [
	{ value: "LDA", label: "LDA — Local density approximation" },
	{ value: "GGA", label: "GGA — Generalized gradient approximation" },
	{ value: "VDW", label: "VDW — van der Waals" },
];

export const SIESTA_XC_AUTHOR_OPTIONS = [
	"CA",
	"PZ",
	"PW92",
	"PW91",
	"PBE",
	"revPBE",
	"RPBE",
	"WC",
	"AM05",
	"PBEsol",
	"PBEJsJrLO",
	"PBEJsJrHEG",
	"PBEGcGxLO",
	"PBEGcGxHEG",
	"BLYP",
	"LYP",
	"DRSLL",
	"DF1",
	"LMKLL",
	"DF2",
	"KBM",
	"C09",
	"BH",
	"VV",
];

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

const getFileExtension = (filename: string) => {
	const separatorIndex = filename.lastIndexOf(".");
	return separatorIndex >= 0
		? filename.slice(separatorIndex).toLowerCase()
		: "";
};

const formatExtensions = (extensions: readonly string[]) =>
	extensions.map((extension) => extension.toUpperCase()).join(" or ");

export const useAdvancedDft = (
	simulator: AdvancedDftSimulator,
	handleConfiguredSubmit: HomeState["handleConfiguredSubmit"],
) => {
	const config = SIMULATOR_CONFIG[simulator];
	const pseudoExtensions: readonly string[] = config.pseudoExtensions;
	const [parameterFile, setParameterFile] = useState<File | null>(null);
	const [structureFile, setStructureFile] = useState<File | null>(null);
	const [structureElements, setStructureElements] = useState<string[]>([]);
	const [structureWarning, setStructureWarning] = useState("");
	const [mode, setMode] = useState<AdvancedDftMode>("basic");
	const [pseudopotentialFiles, setPseudopotentialFiles] =
		useState<PseudopotentialFilesByElement>({});
	const [siestaXcFunctional, setSiestaXcFunctional] = useState("LDA");
	const [siestaXcAuthor, setSiestaXcAuthor] = useState("PZ");
	const [excitingRmtValues, setExcitingRmtValues] = useState<ElementTextValues>(
		{},
	);
	const [showExcitingRmt, setShowExcitingRmt] = useState(false);

	const resetStructureDetails = () => {
		setStructureElements([]);
		setStructureWarning("");
		setPseudopotentialFiles({});
		setExcitingRmtValues({});
		setShowExcitingRmt(false);
	};

	const handleParameterFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];

		if (!file) {
			return;
		}

		const error = validateRequiredFile(
			file,
			`${simulator} parameter file`,
			".csv",
		);

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

		const error = validateRequiredFile(
			file,
			`${simulator} structure file`,
			".cif",
		);

		if (error) {
			toast.error(error);
			event.target.value = "";
			return;
		}

		setStructureFile(file);
		resetStructureDetails();

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

		const extension = getFileExtension(file.name);

		if (pseudoExtensions.length > 0 && !pseudoExtensions.includes(extension)) {
			toast.error(
				`${element} pseudopotential must use ${formatExtensions(pseudoExtensions)} format.`,
			);
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
		resetStructureDetails();
	};

	const removePseudopotentialFile = (element: string) => {
		setPseudopotentialFiles((currentFiles) => {
			const nextFiles = { ...currentFiles };
			delete nextFiles[element];
			return nextFiles;
		});
	};

	const handleExcitingRmtChange = (element: string, value: string) => {
		setExcitingRmtValues((currentValues) => ({
			...currentValues,
			[element]: value,
		}));
	};

	const handleToggleExcitingRmt = () => {
		setShowExcitingRmt((isVisible) => !isVisible);
	};

	const getCleanExcitingRmtValues = () =>
		structureElements.reduce<Record<string, string>>((values, element) => {
			const value = excitingRmtValues[element]?.trim();

			if (value) {
				values[element] = value;
			}

			return values;
		}, {});

	const handleRunSimulation = async () => {
		if (!parameterFile) {
			toast.error(`Upload the ${simulator} CSV parameter file.`);
			return;
		}

		if (!structureFile) {
			toast.error(`Upload the ${simulator} material structure as a CIF file.`);
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

		const rmtValues =
			simulator === "Exciting" ? getCleanExcitingRmtValues() : {};

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
		const extraInputs: Record<string, unknown> = {
			is_advanced: isAdvanced,
			pseudo_file_mapping: pseudopotentialMapping,
			pseudo_mapping: pseudopotentialMapping,
		};

		if (isAdvanced && simulator === "Siesta") {
			extraInputs["XC.Functional"] = siestaXcFunctional;
			extraInputs["XC.Authors"] = siestaXcAuthor;
			extraInputs.xc_functional = siestaXcFunctional;
			extraInputs.xc_authors = siestaXcAuthor;
		}

		if (simulator === "Exciting" && Object.keys(rmtValues).length > 0) {
			extraInputs.rmt = rmtValues;
			extraInputs.rmt_values = rmtValues;
		}

		handleConfiguredSubmit({
			calculatorSlug: simulator,
			extraInputs,
			projectPrefix: config.projectPrefix,
			simulatorLabel: simulator,
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

	const advancedSettings =
		simulator === "Siesta"
			? {
					kind: "siesta" as const,
					handleXcAuthorChange: setSiestaXcAuthor,
					handleXcFunctionalChange: setSiestaXcFunctional,
					xcAuthor: siestaXcAuthor,
					xcFunctional: siestaXcFunctional,
				}
			: simulator === "Exciting"
				? {
						kind: "exciting" as const,
						handleRmtChange: handleExcitingRmtChange,
						handleToggle: handleToggleExcitingRmt,
						rmtValues: excitingRmtValues,
						showRmt: showExcitingRmt,
					}
				: null;

	return {
		advancedSettings,
		handleModeChange: setMode,
		handleParameterFileChange,
		handlePseudopotentialFileChange,
		handleRunSimulation,
		handleStructureFileChange,
		mode,
		parameterFile,
		pseudoAccept:
			pseudoExtensions.length > 0 ? pseudoExtensions.join(",") : undefined,
		pseudoHint:
			pseudoExtensions.length > 0
				? `${formatExtensions(pseudoExtensions)} · Up to 5 MB`
				: "Any file type · Up to 5 MB",
		pseudopotentialFiles,
		removeParameterFile,
		removePseudopotentialFile,
		removeStructureFile,
		structureElements,
		structureFile,
		structureWarning,
	};
};

import { XSquare } from "lucide-react";
import { type ChangeEvent, useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	extractElementsFromCifFile,
	normalizeCifFile,
} from "@/modules/Home/cifParser";
import FileUpload from "@/modules/Home/FileUpload";
import {
	CP2K_TEMPLATE_BASE,
	MAX_FILE_SIZE,
	simulationTypeList,
} from "@/modules/Home/SimUtils";
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

type SelectedFileProps = {
	file: File;
	label: string;
	onRemove: () => void;
};

const SelectedFile = ({ file, label, onRemove }: SelectedFileProps) => (
	<div className="flex min-w-0 items-center justify-between gap-2 rounded border border-gray-200 p-2">
		<p className="min-w-0 truncate text-sm">{file.name}</p>
		<Button
			aria-label={`Remove ${label} ${file.name}`}
			onClick={onRemove}
			variant="ghost"
		>
			<XSquare aria-hidden="true" className="text-red-600" />
		</Button>
	</div>
);

type SupportFileInputProps = {
	ariaLabel: string;
	disabled: boolean;
	file: File | undefined;
	hint: string;
	onChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onRemove: () => void;
};

const SupportFileInput = ({
	ariaLabel,
	disabled,
	file,
	hint,
	onChange,
	onRemove,
}: SupportFileInputProps) =>
	file ? (
		<SelectedFile file={file} label={ariaLabel} onRemove={onRemove} />
	) : (
		<FileUpload
			ariaLabel={ariaLabel}
			disabled={disabled}
			hint={hint}
			onChange={onChange}
		/>
	);

const CP2K = ({ simType, isSubmitting, handleConfiguredSubmit }: HomeState) => {
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
		kind: "pseudopotential" | "basis set",
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

	const removeSupportFile = (
		element: string,
		kind: "pseudopotential" | "basis set",
	) => {
		const setFiles =
			kind === "pseudopotential" ? setPseudopotentialFiles : setBasisFiles;
		setFiles((currentFiles) => {
			const nextFiles = { ...currentFiles };
			delete nextFiles[element];
			return nextFiles;
		});
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

	return (
		<div className="w-full space-y-4">
			<p>Set the required parameters and upload the simulation files.</p>
			<p className="font-semibold text-lg">
				{simulationTypeList.find((item) => item.value === simType)?.label}
			</p>

			<div className="w-full space-y-4 rounded border border-gray-200 p-2">
				<p>
					Upload one CSV parameter file and one CIF structure file. CP2K
					pseudopotential and basis-set files are optional. Each file must be{" "}
					<strong className="font-semibold text-primary">5 MB</strong> or less.
				</p>
				<p className="rounded border border-primary/20 bg-primary/5 p-3 text-sm">
					Support-file rule: upload no support files, or upload both one
					pseudopotential and one basis-set file for every detected element.
				</p>

				<div className="w-full space-y-4 rounded border border-gray-200 p-2">
					<p className="font-semibold text-lg">Input Parameters</p>
					<p>Upload the CP2K input parameters as a CSV file.</p>
					<div className="grid gap-4 sm:grid-cols-2">
						<a
							className={buttonVariants({ variant: "outline" })}
							download="cp2k-input-parameters-template.csv"
							href={`${CP2K_TEMPLATE_BASE}/input-parameters-template.csv`}
						>
							Download CSV Template
						</a>
						<FileUpload
							accept=".csv,text/csv"
							ariaLabel="CP2K CSV parameter file"
							disabled={isSubmitting}
							files={parameterFile ? [parameterFile] : []}
							hint="CSV · Up to 5 MB"
							onChange={handleParameterFileChange}
						/>
					</div>
					{parameterFile ? (
						<SelectedFile
							file={parameterFile}
							label="CP2K parameter file"
							onRemove={() => setParameterFile(null)}
						/>
					) : null}
				</div>

				<div className="w-full space-y-4 rounded border border-gray-200 p-2">
					<p className="font-semibold text-lg">Structure File</p>
					<p>
						Upload the mandatory material structure in CIF format. Elements are
						detected from this file.
					</p>
					<FileUpload
						accept=".cif,chemical/x-cif"
						ariaLabel="CP2K CIF structure file"
						disabled={isSubmitting}
						files={structureFile ? [structureFile] : []}
						hint="CIF · Up to 5 MB"
						onChange={handleStructureFileChange}
					/>
					{structureFile ? (
						<SelectedFile
							file={structureFile}
							label="CP2K structure file"
							onRemove={removeStructureFile}
						/>
					) : null}
				</div>

				<div className="w-full space-y-4 rounded border border-gray-200 p-2">
					<div>
						<p className="font-semibold text-lg">Detected CIF Elements</p>
						<p className="text-sm">
							Upload the CIF to unlock an optional pseudo/basis pair for each
							element.
						</p>
					</div>

					{structureWarning ? (
						<p className="rounded border border-amber-300 bg-amber-50 p-3 text-amber-900 text-sm">
							{structureWarning}
						</p>
					) : null}

					{structureElements.length > 0 ? (
						<div className="space-y-3">
							<p className="text-muted-foreground text-sm">
								{structureElements.length} element
								{structureElements.length === 1 ? "" : "s"} detected
							</p>
							{structureElements.map((element) => (
								<div
									className="space-y-3 rounded border border-gray-200 p-3"
									key={element}
								>
									<div className="min-w-0">
										<span className="inline-flex rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary text-sm">
											{element}
										</span>
										<p className="mt-1 text-muted-foreground text-xs">
											Atomic element from CIF
										</p>
									</div>
									<div className="grid min-w-0 gap-3 sm:grid-cols-2">
										<div className="min-w-0 space-y-2">
											<p className="font-medium text-sm">Pseudopotential</p>
											<SupportFileInput
												ariaLabel={`${element} CP2K pseudopotential`}
												disabled={isSubmitting}
												file={pseudopotentialFiles[element]}
												hint="Pseudo file · Up to 5 MB"
												onChange={(event) =>
													handleSupportFileChange(
														element,
														"pseudopotential",
														event,
													)
												}
												onRemove={() =>
													removeSupportFile(element, "pseudopotential")
												}
											/>
										</div>
										<div className="min-w-0 space-y-2">
											<p className="font-medium text-sm">Basis Set</p>
											<SupportFileInput
												ariaLabel={`${element} CP2K basis set`}
												disabled={isSubmitting}
												file={basisFiles[element]}
												hint="Basis file · Up to 5 MB"
												onChange={(event) =>
													handleSupportFileChange(element, "basis set", event)
												}
												onRemove={() => removeSupportFile(element, "basis set")}
											/>
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<p className="rounded border border-dashed border-gray-300 p-4 text-muted-foreground text-sm">
							Upload a CIF structure file to detect elements and unlock
							per-element CP2K support-file uploads.
						</p>
					)}
				</div>
			</div>

			<Button
				className="my-4 w-full py-4 text-lg"
				disabled={isSubmitting}
				onClick={handleRunSimulation}
			>
				{isSubmitting ? "Simulating" : "Run Simulation"}
			</Button>
		</div>
	);
};

export default CP2K;

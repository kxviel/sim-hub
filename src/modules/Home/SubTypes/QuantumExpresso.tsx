import { XSquare } from "lucide-react";
import { type ChangeEvent, useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	extractElementsFromCifFile,
	normalizeCifFile,
} from "@/modules/Home/cifParser";
import {
	MAX_FILE_SIZE,
	QE_TEMPLATE_BASE,
	simulationTypeList,
} from "@/modules/Home/SimUtils";

import type { HomeState } from "@/modules/Home/useHome";

type PseudopotentialFilesByElement = Record<string, File | undefined>;

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

const QuantumExpresso = ({
	simType,
	isSubmitting,
	handleParamSubmit,
}: HomeState) => {
	const [parameterFile, setParameterFile] = useState<File | null>(null);
	const [structureFile, setStructureFile] = useState<File | null>(null);
	const [structureElements, setStructureElements] = useState<string[]>([]);
	const [structureWarning, setStructureWarning] = useState("");
	const [pseudopotentialFiles, setPseudopotentialFiles] =
		useState<PseudopotentialFilesByElement>({});

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

		const uploadedPseudopotentials = structureElements
			.map((element) => pseudopotentialFiles[element])
			.filter((file): file is File => Boolean(file));

		if (
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
		handleParamSubmit(
			parameterFile,
			normalizedStructureFile,
			uploadedPseudopotentials,
		);
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

	return (
		<div className="w-full space-y-4">
			<p>Set the required parameters and upload the simulation files.</p>
			<p className="font-semibold text-lg">
				{simulationTypeList.find((item) => item.value === simType)?.label}
			</p>

			<div className="w-full space-y-4 rounded border border-gray-200 p-2">
				<p>
					Upload one CSV parameter file and one CIF structure file. UPF
					pseudopotentials are optional. Each file must be{" "}
					<strong className="font-semibold text-primary">5 MB</strong> or less.
				</p>
				<p className="rounded border border-primary/20 bg-primary/5 p-3 text-sm">
					UPF rule: upload no UPF files, or upload one UPF file for every
					detected element.
				</p>

				{requiredFiles.length > 0 ? (
					<div className="w-full space-y-3 rounded border border-gray-200 p-2">
						<p className="font-semibold text-lg">Required Files</p>
						{requiredFiles.map(({ id, label, file }) => (
							<div
								className="flex w-full items-center justify-between gap-2 rounded border border-gray-200 p-2"
								key={id}
							>
								<p className="min-w-0 truncate text-sm">
									<span className="font-semibold">{label}:</span> {file.name}
								</p>
								<Button
									aria-label={`Remove ${file.name}`}
									onClick={() => handleRemoveRequiredFile(id)}
									variant="ghost"
								>
									<XSquare aria-hidden="true" className="text-red-600" />
								</Button>
							</div>
						))}
					</div>
				) : null}

				<div className="w-full space-y-4 rounded border border-gray-200 p-2">
					<p className="font-semibold text-lg">Input Parameters</p>
					<p>Upload the Quantum ESPRESSO input parameters as a CSV file.</p>
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
						<a
							className={buttonVariants({
								className: "sm:w-1/2",
								variant: "outline",
							})}
							download="input-parameters-template.csv"
							href={`${QE_TEMPLATE_BASE}/input-parameters-template.csv`}
						>
							Download CSV Template
						</a>
						<Input
							accept=".csv,text/csv"
							aria-label="CSV parameter file"
							className="sm:w-1/2"
							disabled={isSubmitting}
							onChange={handleParameterFileChange}
							type="file"
						/>
					</div>
				</div>

				<div className="w-full space-y-4 rounded border border-gray-200 p-2">
					<p className="font-semibold text-lg">Structure File</p>
					<p>
						Upload the mandatory material structure in CIF format. Elements are
						detected from this file.
					</p>
					<Input
						accept=".cif,chemical/x-cif"
						aria-label="CIF structure file"
						disabled={isSubmitting}
						onChange={handleStructureFileChange}
						type="file"
					/>
				</div>

				<div className="w-full space-y-4 rounded border border-gray-200 p-2">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p className="font-semibold text-lg">Detected CIF Elements</p>
							<p className="text-sm">
								Upload the CIF to unlock one optional UPF input per element.
							</p>
						</div>
						<a
							className={buttonVariants({ variant: "outline" })}
							download="pseudopotential-template.upf"
							href={`${QE_TEMPLATE_BASE}/pseudopotential-template.upf`}
						>
							Download UPF Template
						</a>
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
							{structureElements.map((element) => {
								const file = pseudopotentialFiles[element];

								return (
									<div
										className="grid gap-3 rounded border border-gray-200 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:items-center"
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
										<div className="flex min-w-0 items-center gap-2">
											{file ? (
												<>
													<p className="min-w-0 flex-1 truncate text-sm">
														{file.name}
													</p>
													<Button
														aria-label={`Remove ${element} pseudopotential`}
														onClick={() =>
															handleRemovePseudopotentialFile(element)
														}
														variant="ghost"
													>
														<XSquare
															aria-hidden="true"
															className="text-red-600"
														/>
													</Button>
												</>
											) : (
												<Input
													accept=".upf"
													aria-label={`${element} UPF pseudopotential`}
													disabled={isSubmitting}
													onChange={(event) =>
														handlePseudopotentialFileChange(element, event)
													}
													type="file"
												/>
											)}
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<p className="rounded border border-dashed border-gray-300 p-4 text-muted-foreground text-sm">
							Upload a CIF structure file to detect elements and unlock
							per-element UPF uploads.
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

export default QuantumExpresso;

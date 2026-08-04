import { ChevronDown, XSquare } from "lucide-react";
import type { ChangeEvent } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FileUpload from "@/modules/Home/FileUpload";
import {
	CP2K_TEMPLATE_BASE,
	simulationTypeList,
} from "@/modules/Home/SimUtils";
import { useCP2K } from "@/modules/Home/SubTypes/useCP2K";
import type { HomeState } from "@/modules/Home/useHome";

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
	error: string | undefined;
	file: File | undefined;
	hint: string;
	onChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onRemove: () => void;
};

const SupportFileInput = ({
	ariaLabel,
	disabled,
	error,
	file,
	hint,
	onChange,
	onRemove,
}: SupportFileInputProps) => (
	<div className="space-y-2">
		{file ? (
			<SelectedFile file={file} label={ariaLabel} onRemove={onRemove} />
		) : (
			<FileUpload
				ariaLabel={ariaLabel}
				disabled={disabled}
				hint={hint}
				onChange={onChange}
			/>
		)}
		{error ? (
			<p className="text-destructive text-sm" role="alert">
				{error}
			</p>
		) : null}
	</div>
);

const CP2K = ({ simType, isSubmitting, handleConfiguredSubmit }: HomeState) => {
	const {
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
	} = useCP2K(handleConfiguredSubmit);

	return (
		<div className="w-full space-y-4">
			<p>Set the required parameters and upload the simulation files.</p>
			<p className="font-semibold text-lg">
				{simulationTypeList.find((item) => item.value === simType)?.label}
			</p>

			<div className="w-full space-y-4 rounded border border-gray-200 p-2">
				<p>
					Upload one CSV parameter file and one CIF structure file. Advanced
					CP2K pseudopotential and basis-set inputs are optional. Each file must
					be <strong className="font-semibold text-primary">5 MB</strong> or
					less.
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
							onRemove={removeParameterFile}
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

				<div className="w-full rounded border border-gray-200 p-2">
					<Button
						aria-expanded={advancedOpen}
						className="w-full justify-between"
						disabled={isSubmitting}
						onClick={toggleAdvanced}
						variant="ghost"
					>
						<span>Advanced Options</span>
						<ChevronDown
							aria-hidden="true"
							className={`transition-transform ${advancedOpen ? "rotate-180" : ""}`}
						/>
					</Button>

					{advancedOpen ? (
						<div className="space-y-4 border-gray-200 border-t px-1 pt-4">
							<p className="rounded border border-primary/20 bg-primary/5 p-3 text-sm">
								Advanced inputs are optional. If any advanced value is set,
								upload one shared pseudopotential file and one shared basis-set
								file, then map every detected element to an entry in each file.
							</p>

							{advancedErrors.summary ? (
								<p className="text-destructive text-sm" role="alert">
									{advancedErrors.summary}
								</p>
							) : null}

							<div className="grid gap-3 sm:grid-cols-2">
								<div className="min-w-0 space-y-2 rounded border border-gray-200 p-3">
									<p className="font-medium text-sm">Pseudopotential File</p>
									<p className="text-muted-foreground text-xs">
										One optional file shared by all detected elements.
									</p>
									<SupportFileInput
										ariaLabel="CP2K shared pseudopotential file"
										disabled={isSubmitting}
										error={advancedErrors.pseudopotentialFile}
										file={pseudopotentialFile ?? undefined}
										hint="Pseudo file · Up to 5 MB"
										onChange={handlePseudopotentialFileChange}
										onRemove={removePseudopotentialFile}
									/>
								</div>
								<div className="min-w-0 space-y-2 rounded border border-gray-200 p-3">
									<p className="font-medium text-sm">Basis-Set File</p>
									<p className="text-muted-foreground text-xs">
										One optional file shared by all detected elements.
									</p>
									<SupportFileInput
										ariaLabel="CP2K shared basis-set file"
										disabled={isSubmitting}
										error={advancedErrors.basisFile}
										file={basisFile ?? undefined}
										hint="Basis file · Up to 5 MB"
										onChange={handleBasisFileChange}
										onRemove={removeBasisFile}
									/>
								</div>
							</div>

							<div className="space-y-3">
								<div>
									<p className="font-semibold text-lg">Detected CIF Elements</p>
									<p className="text-sm">
										Map each element to the exact entry used by the shared
										files.
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
												className="grid gap-3 rounded border border-gray-200 p-3 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)_minmax(0,1fr)]"
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
												<div className="min-w-0 space-y-2">
													<Label htmlFor={`cp2k-pseudo-${element}`}>
														Pseudopotential entry
													</Label>
													<Input
														aria-invalid={Boolean(
															advancedErrors[`pseudo:${element}`],
														)}
														disabled={isSubmitting}
														id={`cp2k-pseudo-${element}`}
														onChange={(event) =>
															handlePseudopotentialNameChange(element, event)
														}
														placeholder={`${element} pseudo name`}
														value={pseudopotentialNames[element] ?? ""}
													/>
													{advancedErrors[`pseudo:${element}`] ? (
														<p
															className="text-destructive text-sm"
															role="alert"
														>
															{advancedErrors[`pseudo:${element}`]}
														</p>
													) : null}
												</div>
												<div className="min-w-0 space-y-2">
													<Label htmlFor={`cp2k-basis-${element}`}>
														Basis-set entry
													</Label>
													<Input
														aria-invalid={Boolean(
															advancedErrors[`basis:${element}`],
														)}
														disabled={isSubmitting}
														id={`cp2k-basis-${element}`}
														onChange={(event) =>
															handleBasisNameChange(element, event)
														}
														placeholder={`${element} basis name`}
														value={basisNames[element] ?? ""}
													/>
													{advancedErrors[`basis:${element}`] ? (
														<p
															className="text-destructive text-sm"
															role="alert"
														>
															{advancedErrors[`basis:${element}`]}
														</p>
													) : null}
												</div>
											</div>
										))}
									</div>
								) : (
									<p className="rounded border border-dashed border-gray-300 p-4 text-muted-foreground text-sm">
										Upload a CIF structure file to detect elements and unlock
										advanced CP2K mappings.
									</p>
								)}
							</div>
						</div>
					) : null}
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

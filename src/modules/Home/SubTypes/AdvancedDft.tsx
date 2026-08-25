import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import FileUpload from "@/modules/Home/FileUpload";
import {
	getSimulationCsvExample,
	simulationTypeList,
} from "@/modules/Home/SimUtils";
import {
	DftModeSelector,
	ElementPseudopotentialUploads,
	SelectedFile,
} from "@/modules/Home/SubTypes/DftFields";
import {
	type AdvancedDftSimulator,
	SIESTA_XC_AUTHOR_OPTIONS,
	SIESTA_XC_FUNCTIONAL_OPTIONS,
	useAdvancedDft,
} from "@/modules/Home/SubTypes/useAdvancedDft";
import type { HomeState } from "@/modules/Home/useHome";

type AdvancedDftProps = Pick<
	HomeState,
	"handleConfiguredSubmit" | "isSubmitting" | "simType"
> & {
	simulator: AdvancedDftSimulator;
};

const SIESTA_XC_AUTHOR_SELECT_OPTIONS = SIESTA_XC_AUTHOR_OPTIONS.map(
	(value) => ({ label: value, value }),
);

type OptionSelectProps = {
	disabled: boolean;
	id: string;
	label: string;
	onChange: (value: string) => void;
	options: { label: string; value: string }[];
	value: string;
};

const OptionSelect = ({
	disabled,
	id,
	label,
	onChange,
	options,
	value,
}: OptionSelectProps) => (
	<div className="space-y-2">
		<Label htmlFor={id}>{label}</Label>
		<Select
			disabled={disabled}
			id={id}
			items={options}
			onValueChange={(nextValue) => onChange(nextValue ?? value)}
			value={value}
		>
			<SelectTrigger className="w-full">
				<SelectValue />
			</SelectTrigger>
			<SelectContent alignItemWithTrigger>
				<SelectGroup>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	</div>
);

const AdvancedDft = ({
	handleConfiguredSubmit,
	isSubmitting,
	simType,
	simulator,
}: AdvancedDftProps) => {
	const {
		advancedSettings,
		handleModeChange,
		handleParameterFileChange,
		handlePseudopotentialFileChange,
		handleRunSimulation,
		handleStructureFileChange,
		mode,
		parameterFile,
		pseudoAccept,
		pseudoHint,
		pseudopotentialFiles,
		removeParameterFile,
		removePseudopotentialFile,
		removeStructureFile,
		structureElements,
		structureFile,
		structureWarning,
		supportsAdvanced,
	} = useAdvancedDft(simulator, handleConfiguredSubmit);
	const acceptedPseudoFiles = pseudoAccept ? { accept: pseudoAccept } : {};
	const csvExample = getSimulationCsvExample(simulator);

	return (
		<div className="w-full space-y-4">
			<p>Set the required parameters and upload the simulation files.</p>
			<p className="font-semibold text-lg">
				{simulationTypeList.find((item) => item.value === simType)?.label}
			</p>

			<div className="w-full space-y-4 rounded border border-gray-200 p-2">
				<p>
					Upload one CSV parameter file and one CIF structure file. Each file
					must be <strong className="font-semibold text-primary">5 MB</strong>{" "}
					or less.
				</p>
				{supportsAdvanced ? (
					<p className="rounded border border-primary/20 bg-primary/5 p-3 text-sm">
						Basic mode submits the required CSV and CIF files. Advanced mode
						requires one pseudopotential for every detected element.
					</p>
				) : (
					<p className="rounded border border-primary/20 bg-primary/5 p-3 text-sm">
						{simulator} requires no pseudopotentials or additional files.
					</p>
				)}

				<div className="w-full space-y-4 rounded border border-gray-200 p-2">
					<p className="font-semibold text-lg">Input Parameters</p>
					<p>Upload the {simulator} input parameters as a CSV file.</p>
					<div className={csvExample ? "grid gap-3 sm:grid-cols-2" : undefined}>
						{csvExample ? (
							<a
								className={buttonVariants({ variant: "outline" })}
								download={csvExample.downloadName}
								href={csvExample.href}
							>
								Download CSV Example
							</a>
						) : null}
						<FileUpload
							accept=".csv,text/csv"
							ariaLabel={`${simulator} CSV parameter file`}
							disabled={isSubmitting}
							files={parameterFile ? [parameterFile] : []}
							hint="CSV · Up to 5 MB"
							onChange={handleParameterFileChange}
						/>
					</div>
					{parameterFile ? (
						<SelectedFile
							ariaLabel={`Remove ${parameterFile.name}`}
							file={parameterFile}
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
						ariaLabel={`${simulator} CIF structure file`}
						disabled={isSubmitting}
						files={structureFile ? [structureFile] : []}
						hint="CIF · Up to 5 MB"
						onChange={handleStructureFileChange}
					/>
					{structureFile ? (
						<SelectedFile
							ariaLabel={`Remove ${structureFile.name}`}
							file={structureFile}
							onRemove={removeStructureFile}
						/>
					) : null}
				</div>

				{supportsAdvanced ? (
					<div className="w-full space-y-4 rounded border border-gray-200 p-2">
						<DftModeSelector
							disabled={isSubmitting}
							mode={mode}
							onChange={handleModeChange}
							simulator={simulator}
						/>

						{advancedSettings?.kind === "exciting" ? (
							<div className="space-y-3 rounded border border-gray-200 p-3">
								<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
									<div>
										<p className="font-semibold">Optional RMT Parameters</p>
										<p className="text-muted-foreground text-sm">
											Set a muffin-tin radius per detected element, or leave all
											values blank to use backend defaults.
										</p>
									</div>
									<Button
										disabled={isSubmitting || structureElements.length === 0}
										onClick={advancedSettings.handleToggle}
										type="button"
										variant="outline"
									>
										{advancedSettings.showRmt ? "Hide RMT" : "Show RMT"}
									</Button>
								</div>
								{structureElements.length === 0 ? (
									<p className="rounded border border-dashed border-gray-300 p-3 text-muted-foreground text-sm">
										Upload a CIF structure file to unlock optional RMT inputs.
									</p>
								) : advancedSettings.showRmt ? (
									<div className="grid gap-3 sm:grid-cols-2">
										{structureElements.map((element) => (
											<div className="space-y-2" key={element}>
												<Label htmlFor={`exciting-rmt-${element}`}>
													{element} RMT
												</Label>
												<Input
													disabled={isSubmitting}
													id={`exciting-rmt-${element}`}
													min="0"
													onChange={(event) =>
														advancedSettings.handleRmtChange(
															element,
															event.target.value,
														)
													}
													placeholder="Optional"
													step="any"
													type="number"
													value={advancedSettings.rmtValues[element] ?? ""}
												/>
											</div>
										))}
									</div>
								) : null}
							</div>
						) : null}

						{mode === "basic" ? (
							<p className="rounded border border-dashed border-gray-300 p-4 text-muted-foreground text-sm">
								Basic mode submits only the CSV parameter and CIF structure
								files.
							</p>
						) : (
							<div className="space-y-4">
								{advancedSettings?.kind === "siesta" ? (
									<div className="grid gap-4 rounded border border-gray-200 p-3 sm:grid-cols-2">
										<OptionSelect
											disabled={isSubmitting}
											id="siesta-xc-functional"
											label="XC.Functional"
											onChange={advancedSettings.handleXcFunctionalChange}
											options={SIESTA_XC_FUNCTIONAL_OPTIONS}
											value={advancedSettings.xcFunctional}
										/>
										<OptionSelect
											disabled={isSubmitting}
											id="siesta-xc-author"
											label="XC.Authors"
											onChange={advancedSettings.handleXcAuthorChange}
											options={SIESTA_XC_AUTHOR_SELECT_OPTIONS}
											value={advancedSettings.xcAuthor}
										/>
									</div>
								) : null}

								<ElementPseudopotentialUploads
									{...acceptedPseudoFiles}
									ariaLabelSuffix={`${simulator} pseudopotential`}
									description="Upload one pseudopotential input per detected element."
									disabled={isSubmitting}
									elements={structureElements}
									emptyMessage="Upload a CIF structure file to detect elements and unlock per-element pseudopotential uploads."
									files={pseudopotentialFiles}
									hint={pseudoHint}
									onChange={handlePseudopotentialFileChange}
									onRemove={removePseudopotentialFile}
									warning={structureWarning}
								/>
							</div>
						)}
					</div>
				) : null}
			</div>

			<Button
				className="my-4 w-full py-4 text-lg"
				disabled={isSubmitting}
				onClick={handleRunSimulation}
				type="button"
			>
				{isSubmitting ? "Simulating" : "Run Simulation"}
			</Button>
		</div>
	);
};

export default AdvancedDft;

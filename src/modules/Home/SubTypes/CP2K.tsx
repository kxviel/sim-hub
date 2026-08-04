import { XSquare } from "lucide-react";
import type { ChangeEvent } from "react";
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
	CP2K_TEMPLATE_BASE,
	simulationTypeList,
} from "@/modules/Home/SimUtils";
import {
	CP2K_BASIS_SET_OPTIONS,
	CP2K_PSEUDOPOTENTIAL_OPTIONS,
	CP2K_XC_FUNCTIONAL_OPTIONS,
	type Cp2kMode,
	useCP2K,
} from "@/modules/Home/SubTypes/useCP2K";
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
			type="button"
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

type Cp2kBasicSettingsProps = {
	basicBasisSet: string;
	basicPseudopotential: string;
	disabled: boolean;
	errors: Record<string, string | undefined>;
	onBasicBasisSetChange: (value: string | null) => void;
	onBasicPseudopotentialChange: (value: string | null) => void;
	structureElements: string[];
	structureWarning: string;
};

const Cp2kBasicSettings = ({
	basicBasisSet,
	basicPseudopotential,
	disabled,
	errors,
	onBasicBasisSetChange,
	onBasicPseudopotentialChange,
	structureElements,
	structureWarning,
}: Cp2kBasicSettingsProps) => (
	<div className="space-y-4">
		<p className="rounded border border-primary/20 bg-primary/5 p-3 text-sm">
			Basic mode applies one supported pseudopotential and basis-set choice to
			every element detected in the CIF file.
		</p>

		<div className="grid gap-4 sm:grid-cols-2">
			<div className="space-y-2">
				<Label htmlFor="cp2k-basic-pseudopotential">Pseudopotential</Label>
				<Select
					disabled={disabled}
					id="cp2k-basic-pseudopotential"
					items={CP2K_PSEUDOPOTENTIAL_OPTIONS}
					onValueChange={onBasicPseudopotentialChange}
					value={basicPseudopotential || null}
				>
					<SelectTrigger aria-invalid={Boolean(errors.basicPseudopotential)}>
						<SelectValue placeholder="Select a pseudopotential" />
					</SelectTrigger>
					<SelectContent alignItemWithTrigger>
						<SelectGroup>
							{CP2K_PSEUDOPOTENTIAL_OPTIONS.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
				{errors.basicPseudopotential ? (
					<p className="text-destructive text-sm" role="alert">
						{errors.basicPseudopotential}
					</p>
				) : null}
			</div>

			<div className="space-y-2">
				<Label htmlFor="cp2k-basic-basis-set">Basis Set</Label>
				<Select
					disabled={disabled}
					id="cp2k-basic-basis-set"
					items={CP2K_BASIS_SET_OPTIONS}
					onValueChange={onBasicBasisSetChange}
					value={basicBasisSet || null}
				>
					<SelectTrigger aria-invalid={Boolean(errors.basicBasisSet)}>
						<SelectValue placeholder="Select a basis set" />
					</SelectTrigger>
					<SelectContent alignItemWithTrigger>
						<SelectGroup>
							{CP2K_BASIS_SET_OPTIONS.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
				{errors.basicBasisSet ? (
					<p className="text-destructive text-sm" role="alert">
						{errors.basicBasisSet}
					</p>
				) : null}
			</div>
		</div>

		<div className="space-y-3">
			<div>
				<p className="font-semibold text-lg">Detected CIF Elements</p>
				<p className="text-sm">Preview the mapping submitted for Basic mode.</p>
			</div>
			{structureWarning ? (
				<p className="rounded border border-amber-300 bg-amber-50 p-3 text-amber-900 text-sm">
					{structureWarning}
				</p>
			) : null}
			{structureElements.length > 0 ? (
				<div className="space-y-2">
					{structureElements.map((element) => (
						<div
							className="grid gap-2 rounded border border-gray-200 p-3 text-sm sm:grid-cols-[5rem_minmax(0,1fr)_minmax(0,1fr)]"
							key={element}
						>
							<span className="font-semibold text-primary">{element}</span>
							<span>Basis: {basicBasisSet}</span>
							<span>Potential: {basicPseudopotential}</span>
						</div>
					))}
				</div>
			) : (
				<p className="rounded border border-dashed border-gray-300 p-4 text-muted-foreground text-sm">
					Upload a CIF structure file to preview the generated element mapping.
				</p>
			)}
		</div>
	</div>
);

type Cp2kAdvancedSettingsProps = {
	basisFile: File | null;
	basisNames: Record<string, string | undefined>;
	disabled: boolean;
	errors: Record<string, string | undefined>;
	onBasisFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onBasisNameChange: (
		element: string,
		event: ChangeEvent<HTMLInputElement>,
	) => void;
	onPseudopotentialFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onPseudopotentialNameChange: (
		element: string,
		event: ChangeEvent<HTMLInputElement>,
	) => void;
	onRemoveBasisFile: () => void;
	onRemovePseudopotentialFile: () => void;
	onXcFunctionalChange: (value: string | null) => void;
	pseudopotentialFile: File | null;
	pseudopotentialNames: Record<string, string | undefined>;
	structureElements: string[];
	structureWarning: string;
	xcFunctional: string;
};

const Cp2kAdvancedSettings = ({
	basisFile,
	basisNames,
	disabled,
	errors,
	onBasisFileChange,
	onBasisNameChange,
	onPseudopotentialFileChange,
	onPseudopotentialNameChange,
	onRemoveBasisFile,
	onRemovePseudopotentialFile,
	onXcFunctionalChange,
	pseudopotentialFile,
	pseudopotentialNames,
	structureElements,
	structureWarning,
	xcFunctional,
}: Cp2kAdvancedSettingsProps) => (
	<div className="space-y-4">
		<p className="rounded border border-primary/20 bg-primary/5 p-3 text-sm">
			Advanced mode requires shared pseudopotential and basis-set files, an XC
			functional, and an exact mapping for every detected element.
		</p>

		<div className="grid gap-3 sm:grid-cols-2">
			<div className="min-w-0 space-y-2 rounded border border-gray-200 p-3">
				<p className="font-medium text-sm">Pseudopotential File</p>
				<p className="text-muted-foreground text-xs">
					One file shared by all detected elements.
				</p>
				<SupportFileInput
					ariaLabel="CP2K shared pseudopotential file"
					disabled={disabled}
					error={errors.pseudopotentialFile}
					file={pseudopotentialFile ?? undefined}
					hint="Pseudo file · Up to 5 MB"
					onChange={onPseudopotentialFileChange}
					onRemove={onRemovePseudopotentialFile}
				/>
			</div>
			<div className="min-w-0 space-y-2 rounded border border-gray-200 p-3">
				<p className="font-medium text-sm">Basis-Set File</p>
				<p className="text-muted-foreground text-xs">
					One file shared by all detected elements.
				</p>
				<SupportFileInput
					ariaLabel="CP2K shared basis-set file"
					disabled={disabled}
					error={errors.basisFile}
					file={basisFile ?? undefined}
					hint="Basis file · Up to 5 MB"
					onChange={onBasisFileChange}
					onRemove={onRemoveBasisFile}
				/>
			</div>
		</div>

		<div className="space-y-2">
			<Label htmlFor="cp2k-xc-functional">XC Functional</Label>
			<Select
				disabled={disabled}
				id="cp2k-xc-functional"
				items={CP2K_XC_FUNCTIONAL_OPTIONS}
				onValueChange={onXcFunctionalChange}
				value={xcFunctional || null}
			>
				<SelectTrigger aria-invalid={Boolean(errors.xcFunctional)}>
					<SelectValue placeholder="Select an XC functional" />
				</SelectTrigger>
				<SelectContent alignItemWithTrigger>
					<SelectGroup>
						{CP2K_XC_FUNCTIONAL_OPTIONS.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
			{errors.xcFunctional ? (
				<p className="text-destructive text-sm" role="alert">
					{errors.xcFunctional}
				</p>
			) : null}
		</div>

		<div className="space-y-3">
			<div>
				<p className="font-semibold text-lg">Detected CIF Elements</p>
				<p className="text-sm">
					Map each element to the exact entry used by the shared files.
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
									aria-invalid={Boolean(errors[`pseudo:${element}`])}
									disabled={disabled}
									id={`cp2k-pseudo-${element}`}
									onChange={(event) =>
										onPseudopotentialNameChange(element, event)
									}
									placeholder={`${element} pseudo name`}
									value={pseudopotentialNames[element] ?? ""}
								/>
								{errors[`pseudo:${element}`] ? (
									<p className="text-destructive text-sm" role="alert">
										{errors[`pseudo:${element}`]}
									</p>
								) : null}
							</div>
							<div className="min-w-0 space-y-2">
								<Label htmlFor={`cp2k-basis-${element}`}>Basis-set entry</Label>
								<Input
									aria-invalid={Boolean(errors[`basis:${element}`])}
									disabled={disabled}
									id={`cp2k-basis-${element}`}
									onChange={(event) => onBasisNameChange(element, event)}
									placeholder={`${element} basis name`}
									value={basisNames[element] ?? ""}
								/>
								{errors[`basis:${element}`] ? (
									<p className="text-destructive text-sm" role="alert">
										{errors[`basis:${element}`]}
									</p>
								) : null}
							</div>
						</div>
					))}
				</div>
			) : (
				<p className="rounded border border-dashed border-gray-300 p-4 text-muted-foreground text-sm">
					Upload a CIF structure file to detect elements and unlock advanced
					CP2K mappings.
				</p>
			)}
		</div>
	</div>
);

const CP2K = ({ simType, isSubmitting, handleConfiguredSubmit }: HomeState) => {
	const {
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
	} = useCP2K(handleConfiguredSubmit);

	return (
		<div className="w-full space-y-4">
			<p>Set the required parameters and upload the simulation files.</p>
			<p className="font-semibold text-lg">
				{simulationTypeList.find((item) => item.value === simType)?.label}
			</p>

			<div className="w-full space-y-4 rounded border border-gray-200 p-2">
				<p>
					Upload one CSV parameter file and one CIF structure file. Then choose
					Basic or Advanced CP2K configuration. Each file must be{" "}
					<strong className="font-semibold text-primary">5 MB</strong> or less.
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

				<div className="w-full space-y-4 rounded border border-gray-200 p-2">
					<fieldset className="inline-flex rounded border border-gray-200 bg-muted p-1">
						<legend className="sr-only">CP2K configuration mode</legend>
						{(["basic", "advanced"] as Cp2kMode[]).map((option) => (
							<Button
								aria-pressed={mode === option}
								disabled={isSubmitting}
								key={option}
								onClick={() => handleModeChange(option)}
								type="button"
								variant={mode === option ? "default" : "ghost"}
							>
								{option === "basic" ? "Basic" : "Advanced"}
							</Button>
						))}
					</fieldset>

					{errors.summary ? (
						<p className="text-destructive text-sm" role="alert">
							{errors.summary}
						</p>
					) : null}

					{mode === "basic" ? (
						<Cp2kBasicSettings
							basicBasisSet={basicBasisSet}
							basicPseudopotential={basicPseudopotential}
							disabled={isSubmitting}
							errors={errors}
							onBasicBasisSetChange={handleBasicBasisSetChange}
							onBasicPseudopotentialChange={handleBasicPseudopotentialChange}
							structureElements={structureElements}
							structureWarning={structureWarning}
						/>
					) : (
						<Cp2kAdvancedSettings
							basisFile={basisFile}
							basisNames={basisNames}
							disabled={isSubmitting}
							errors={errors}
							onBasisFileChange={handleBasisFileChange}
							onBasisNameChange={handleBasisNameChange}
							onPseudopotentialFileChange={handlePseudopotentialFileChange}
							onPseudopotentialNameChange={handlePseudopotentialNameChange}
							onRemoveBasisFile={removeBasisFile}
							onRemovePseudopotentialFile={removePseudopotentialFile}
							onXcFunctionalChange={handleXcFunctionalChange}
							pseudopotentialFile={pseudopotentialFile}
							pseudopotentialNames={pseudopotentialNames}
							structureElements={structureElements}
							structureWarning={structureWarning}
							xcFunctional={xcFunctional}
						/>
					)}
				</div>
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

export default CP2K;

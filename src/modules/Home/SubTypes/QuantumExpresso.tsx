import { XSquare } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import FileUpload from "@/modules/Home/FileUpload";
import { QE_TEMPLATE_BASE, simulationTypeList } from "@/modules/Home/SimUtils";
import {
	DftModeSelector,
	ElementPseudopotentialUploads,
} from "@/modules/Home/SubTypes/DftFields";
import { useQuantumExpresso } from "@/modules/Home/SubTypes/useQuantumExpresso";
import type { HomeState } from "@/modules/Home/useHome";

const QuantumExpresso = ({
	simType,
	isSubmitting,
	handleConfiguredSubmit,
}: HomeState) => {
	const {
		handleModeChange,
		handleParameterFileChange,
		handlePseudopotentialFileChange,
		handleRemovePseudopotentialFile,
		handleRemoveRequiredFile,
		handleRunSimulation,
		handleStructureFileChange,
		mode,
		parameterFile,
		pseudopotentialFiles,
		requiredFiles,
		structureElements,
		structureFile,
		structureWarning,
	} = useQuantumExpresso(handleConfiguredSubmit);

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
				<p className="rounded border border-primary/20 bg-primary/5 p-3 text-sm">
					Basic mode submits only CSV and CIF files. Advanced mode can include
					one UPF pseudopotential for every detected element.
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
					<div className="grid gap-4 sm:grid-cols-2">
						<a
							className={buttonVariants({
								variant: "outline",
							})}
							download="input-parameters-template.csv"
							href={`${QE_TEMPLATE_BASE}/input-parameters-template.csv`}
						>
							Download CSV Template
						</a>
						<FileUpload
							accept=".csv,text/csv"
							ariaLabel="Quantum ESPRESSO CSV parameter file"
							disabled={isSubmitting}
							files={parameterFile ? [parameterFile] : []}
							hint="CSV · Up to 5 MB"
							onChange={handleParameterFileChange}
						/>
					</div>
				</div>

				<div className="w-full space-y-4 rounded border border-gray-200 p-2">
					<p className="font-semibold text-lg">Structure File</p>
					<p>
						Upload the mandatory material structure in CIF format. Elements are
						detected from this file.
					</p>
					<FileUpload
						accept=".cif,chemical/x-cif"
						ariaLabel="Quantum ESPRESSO CIF structure file"
						disabled={isSubmitting}
						files={structureFile ? [structureFile] : []}
						hint="CIF · Up to 5 MB"
						onChange={handleStructureFileChange}
					/>
				</div>

				<div className="w-full space-y-4 rounded border border-gray-200 p-2">
					<DftModeSelector
						disabled={isSubmitting}
						mode={mode}
						onChange={handleModeChange}
						simulator="Quantum ESPRESSO"
					/>

					{mode === "basic" ? (
						<p className="rounded border border-dashed border-gray-300 p-4 text-muted-foreground text-sm">
							Basic mode submits only the CSV parameter and CIF structure files.
						</p>
					) : (
						<ElementPseudopotentialUploads
							accept=".upf"
							ariaLabelSuffix="UPF pseudopotential"
							description="Optionally upload one UPF input per detected element."
							disabled={isSubmitting}
							elements={structureElements}
							emptyMessage="Upload a CIF structure file to detect elements and unlock per-element UPF uploads."
							files={pseudopotentialFiles}
							hint="UPF · Up to 5 MB"
							onChange={handlePseudopotentialFileChange}
							onRemove={handleRemovePseudopotentialFile}
							warning={structureWarning}
						>
							<a
								className={buttonVariants({ variant: "outline" })}
								download="pseudopotential-template.upf"
								href={`${QE_TEMPLATE_BASE}/pseudopotential-template.upf`}
							>
								Download UPF Template
							</a>
						</ElementPseudopotentialUploads>
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

import { Button } from "@/components/ui/button";
import FileUpload from "@/modules/Home/FileUpload";
import { simulationTypeList } from "@/modules/Home/SimUtils";
import {
	ElementPseudopotentialUploads,
	SelectedFile,
} from "@/modules/Home/SubTypes/DftFields";
import { type BigDftMode, useBigDFT } from "@/modules/Home/SubTypes/useBigDFT";
import type { HomeState } from "@/modules/Home/useHome";

const BigDFT = ({
	simType,
	isSubmitting,
	handleConfiguredSubmit,
}: HomeState) => {
	const {
		handleModeChange,
		handleParameterFileChange,
		handlePseudopotentialFileChange,
		handleRunSimulation,
		handleStructureFileChange,
		mode,
		parameterFile,
		pseudopotentialFiles,
		removeParameterFile,
		removePseudopotentialFile,
		removeStructureFile,
		structureElements,
		structureFile,
		structureWarning,
	} = useBigDFT(handleConfiguredSubmit);

	return (
		<div className="w-full space-y-4">
			<p>Set the required parameters and upload the simulation files.</p>
			<p className="font-semibold text-lg">
				{simulationTypeList.find((item) => item.value === simType)?.label}
			</p>

			<div className="w-full space-y-4 rounded border border-gray-200 p-2">
				<p>
					Upload one CSV parameter file and one CIF structure file.
					Pseudopotential uploads are available in Advanced mode and may use any
					file format. Each file must be{" "}
					<strong className="font-semibold text-primary">5 MB</strong> or less.
				</p>
				<p className="rounded border border-primary/20 bg-primary/5 p-3 text-sm">
					Basic mode uses BigDFT&apos;s internal pseudopotentials. Advanced mode
					requires one uploaded pseudopotential for every detected element.
				</p>

				<div className="w-full space-y-4 rounded border border-gray-200 p-2">
					<p className="font-semibold text-lg">Input Parameters</p>
					<p>Upload the BigDFT input parameters as a CSV file.</p>
					<FileUpload
						accept=".csv,text/csv"
						ariaLabel="BigDFT CSV parameter file"
						disabled={isSubmitting}
						files={parameterFile ? [parameterFile] : []}
						hint="CSV · Up to 5 MB"
						onChange={handleParameterFileChange}
					/>
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
						ariaLabel="BigDFT CIF structure file"
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

				<div className="w-full space-y-4 rounded border border-gray-200 p-2">
					<fieldset className="inline-flex rounded border border-gray-200 bg-muted p-1">
						<legend className="sr-only">BigDFT configuration mode</legend>
						{(["basic", "advanced"] as BigDftMode[]).map((option) => (
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

					{mode === "basic" ? (
						<p className="rounded border border-dashed border-gray-300 p-4 text-muted-foreground text-sm">
							Basic mode submits only the CSV parameter and CIF structure files.
						</p>
					) : (
						<ElementPseudopotentialUploads
							ariaLabelSuffix="BigDFT pseudopotential"
							description="Upload one pseudopotential input per detected element."
							disabled={isSubmitting}
							elements={structureElements}
							emptyMessage="Upload a CIF structure file to detect elements and unlock per-element pseudopotential uploads."
							files={pseudopotentialFiles}
							hint="Any file type · Up to 5 MB"
							onChange={handlePseudopotentialFileChange}
							onRemove={removePseudopotentialFile}
							warning={structureWarning}
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

export default BigDFT;

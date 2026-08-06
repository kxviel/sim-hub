import { Button, buttonVariants } from "@/components/ui/button";
import FileUpload from "@/modules/Home/FileUpload";
import {
	ABINIT_TEMPLATE_BASE,
	simulationTypeList,
} from "@/modules/Home/SimUtils";
import {
	ElementPseudopotentialUploads,
	SelectedFile,
} from "@/modules/Home/SubTypes/DftFields";
import {
	ABINIT_PSEUDOPOTENTIAL_EXTENSIONS,
	useABINIT,
} from "@/modules/Home/SubTypes/useABINIT";
import type { HomeState } from "@/modules/Home/useHome";

const ABINIT = ({
	simType,
	isSubmitting,
	handleConfiguredSubmit,
}: HomeState) => {
	const {
		handleParameterFileChange,
		handlePseudopotentialFileChange,
		handleRemovePseudopotentialFile,
		handleRunSimulation,
		handleStructureFileChange,
		parameterFile,
		pseudopotentialFiles,
		removeParameterFile,
		removeStructureFile,
		structureElements,
		structureFile,
		structureWarning,
	} = useABINIT(handleConfiguredSubmit);

	return (
		<div className="w-full space-y-4">
			<p>Set the required parameters and upload the simulation files.</p>
			<p className="font-semibold text-lg">
				{simulationTypeList.find((item) => item.value === simType)?.label}
			</p>

			<div className="w-full space-y-4 rounded border border-gray-200 p-2">
				<p>
					Upload one CSV parameter file and one CIF structure file.
					Pseudopotentials are optional. Each file must be{" "}
					<strong className="font-semibold text-primary">5 MB</strong> or less.
				</p>
				<p className="rounded border border-primary/20 bg-primary/5 p-3 text-sm">
					Pseudopotential rule: upload none, or upload one file for every
					detected element. All uploaded files must share one format: .xml,
					.paw, or .psp8.
				</p>

				<div className="w-full space-y-4 rounded border border-gray-200 p-2">
					<p className="font-semibold text-lg">Input Parameters</p>
					<p>Upload the ABINIT input parameters as a CSV file.</p>
					<div className="grid gap-4 sm:grid-cols-2">
						<a
							className={buttonVariants({
								variant: "outline",
							})}
							download="abinit-input-parameters-template.csv"
							href={`${ABINIT_TEMPLATE_BASE}/input-parameters-template.csv`}
						>
							Download CSV Template
						</a>
						<FileUpload
							accept=".csv,text/csv"
							ariaLabel="ABINIT CSV parameter file"
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
						ariaLabel="ABINIT CIF structure file"
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

				<ElementPseudopotentialUploads
					accept={ABINIT_PSEUDOPOTENTIAL_EXTENSIONS.join(",")}
					ariaLabelSuffix="ABINIT pseudopotential"
					description="Upload the CIF to unlock one optional pseudopotential input per element."
					disabled={isSubmitting}
					elements={structureElements}
					emptyMessage="Upload a CIF structure file to detect elements and unlock per-element pseudopotential uploads."
					files={pseudopotentialFiles}
					hint="XML, PAW, or PSP8 · Up to 5 MB"
					onChange={handlePseudopotentialFileChange}
					onRemove={handleRemovePseudopotentialFile}
					warning={structureWarning}
				/>
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

export default ABINIT;

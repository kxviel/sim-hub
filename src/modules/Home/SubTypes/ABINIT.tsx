import { XSquare } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import FileUpload from "@/modules/Home/FileUpload";
import {
	ABINIT_TEMPLATE_BASE,
	simulationTypeList,
} from "@/modules/Home/SimUtils";
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
						<div className="flex items-center justify-between gap-2 rounded border border-gray-200 p-2">
							<p className="min-w-0 truncate text-sm">{parameterFile.name}</p>
							<Button
								aria-label={`Remove ${parameterFile.name}`}
								onClick={removeParameterFile}
								variant="ghost"
							>
								<XSquare aria-hidden="true" className="text-red-600" />
							</Button>
						</div>
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
						<div className="flex items-center justify-between gap-2 rounded border border-gray-200 p-2">
							<p className="min-w-0 truncate text-sm">{structureFile.name}</p>
							<Button
								aria-label={`Remove ${structureFile.name}`}
								onClick={removeStructureFile}
								variant="ghost"
							>
								<XSquare aria-hidden="true" className="text-red-600" />
							</Button>
						</div>
					) : null}
				</div>

				<div className="w-full space-y-4 rounded border border-gray-200 p-2">
					<div>
						<p className="font-semibold text-lg">Detected CIF Elements</p>
						<p className="text-sm">
							Upload the CIF to unlock one optional pseudopotential input per
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
												<FileUpload
													accept={ABINIT_PSEUDOPOTENTIAL_EXTENSIONS.join(",")}
													ariaLabel={`${element} ABINIT pseudopotential`}
													disabled={isSubmitting}
													hint="XML, PAW, or PSP8 · Up to 5 MB"
													onChange={(event) =>
														handlePseudopotentialFileChange(element, event)
													}
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
							per-element pseudopotential uploads.
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

export default ABINIT;

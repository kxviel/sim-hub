import { XSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileUpload from "@/modules/Home/FileUpload";
import { simulationTypeList } from "@/modules/Home/SimUtils";
import { useMonteCarlo } from "@/modules/Home/SubTypes/useMonteCarlo";
import type { HomeState } from "@/modules/Home/useHome";

const MonteCarlo = (homeState: HomeState) => {
	const { simType, isSubmitting, handleConfiguredSubmit } = homeState;

	const {
		files,
		handleFileChange,
		handleOptionalFileChange,
		handleRemoveFile,
		handleRemoveOptionalFile,
		handleRunSimulation,
		optionalfiles,
	} = useMonteCarlo(handleConfiguredSubmit);

	return (
		<div className="w-full space-y-4">
			<p>Upload a Monte Carlo configuration and optional input datasets.</p>
			<p className="font-semibold text-lg">
				{simulationTypeList.filter((x) => x.value === simType)[0]?.label}
			</p>

			<div className="w-full space-y-4 rounded border border-gray-200 p-2">
				<p>
					This generic template is intentionally backend-neutral because the ODP
					does not define a Monte Carlo simulator contract. Each file must be{" "}
					<strong className="text-primary font-semibold">5 MB</strong> or less.
				</p>

				{files.length > 0 && (
					<div className="w-full space-y-4 rounded border border-gray-200 p-2">
						<p className="font-semibold text-lg">Uploaded Files: </p>

						<div className="w-full p-2 flex items-center gap-2 flex-wrap">
							{files.map((file, i) => (
								<div
									className="w-full rounded border border-gray-200 p-2 flex gap-1 items-center justify-between"
									key={file.name}
								>
									<p className="font-semibold text-sm truncate">{file.name}</p>

									<Button
										aria-label={`Remove ${file.name}`}
										onClick={() => handleRemoveFile(i)}
										variant="ghost"
									>
										<XSquare aria-hidden="true" className="text-red-600" />
									</Button>
								</div>
							))}
						</div>
					</div>
				)}

				<div className="w-full space-y-4 rounded border border-gray-200 p-2">
					<p className="font-semibold text-lg">Run Configuration</p>
					<p>
						Upload the sampling, seed, step-count, and model configuration
						expected by the future backend.
					</p>

					<FileUpload
						accept=".json,.yaml,.yml,.csv"
						ariaLabel="Monte Carlo configuration"
						disabled={isSubmitting}
						files={files}
						hint="JSON, YAML, or CSV · Up to 5 MB"
						onChange={handleFileChange}
					/>
				</div>

				{optionalfiles.length > 0 && (
					<div className="w-full space-y-4 rounded border border-gray-200 p-2">
						<p className="font-semibold text-lg">Optional Uploaded Files: </p>

						<div className="w-full p-2 flex items-center gap-2 flex-wrap">
							{optionalfiles.map((file, i) => (
								<div
									className="w-full rounded border border-gray-200 p-2 flex gap-1 items-center justify-between"
									key={file.name}
								>
									<p className="font-semibold text-sm truncate">{file.name}</p>

									<Button
										aria-label={`Remove ${file.name}`}
										onClick={() => handleRemoveOptionalFile(i)}
										variant="ghost"
									>
										<XSquare aria-hidden="true" className="text-red-600" />
									</Button>
								</div>
							))}
						</div>
					</div>
				)}

				<div className="w-full space-y-4 rounded border border-gray-200 p-2">
					<p className="font-semibold text-lg">Input Datasets</p>
					<p>Optional tabular, structure, or restart data used by the run.</p>

					<FileUpload
						accept=".csv,.json,.txt"
						ariaLabel="Monte Carlo supporting data"
						disabled={isSubmitting}
						files={optionalfiles}
						hint="CSV, JSON, or text · Up to 5 MB each"
						multiple
						onChange={handleOptionalFileChange}
					/>
				</div>
			</div>

			<Button
				className="my-4 py-4 w-full text-lg"
				disabled={isSubmitting}
				onClick={handleRunSimulation}
			>
				{isSubmitting ? "Simulating" : "Run Simulation"}
			</Button>
		</div>
	);
};

export default MonteCarlo;

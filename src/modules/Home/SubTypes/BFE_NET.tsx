import { XSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileUpload from "@/modules/Home/FileUpload";
import { simulationTypeList } from "@/modules/Home/SimUtils";
import { useBFE_NET } from "@/modules/Home/SubTypes/useBFE_NET";
import type { HomeState } from "@/modules/Home/useHome";

const BFE_NET = (homeState: HomeState) => {
	const { simType, isSubmitting, handleConfiguredSubmit } = homeState;

	const {
		files,
		handleFileChange,
		handleOptionalFileChange,
		handleRemoveFile,
		handleRemoveOptionalFile,
		handleRunSimulation,
		optionalfiles,
	} = useBFE_NET(handleConfiguredSubmit);

	return (
		<div className="w-full space-y-4">
			<p>Upload a BFE.NET cantilever model definition and supporting data.</p>
			<p className="font-semibold text-lg">
				{simulationTypeList.filter((x) => x.value === simType)[0]?.label}
			</p>

			<div className="w-full space-y-4 rounded border border-gray-200 p-2">
				<p>
					This API template sends one model definition and optional supporting
					files. Each file must be{" "}
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
					<p className="font-semibold text-lg">Model Definition</p>
					<p>
						Upload the cantilever geometry, material, load, and
						boundary-condition definition expected by the backend.
					</p>

					<FileUpload
						accept=".json,.xml,.txt"
						ariaLabel="BFE.NET model definition"
						disabled={isSubmitting}
						files={files}
						hint="JSON, XML, or text · Up to 5 MB"
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
					<p className="font-semibold text-lg">Supporting Files</p>
					<p>Optional mesh, material-library, or additional model files.</p>

					<FileUpload
						ariaLabel="BFE.NET supporting files"
						disabled={isSubmitting}
						files={optionalfiles}
						hint="Meshes, materials, or supporting models · Up to 5 MB each"
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

export default BFE_NET;

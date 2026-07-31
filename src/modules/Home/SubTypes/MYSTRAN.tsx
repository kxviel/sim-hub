import { XSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileUpload from "@/modules/Home/FileUpload";
import { simulationTypeList } from "@/modules/Home/SimUtils";
import { useMYSTRAN } from "@/modules/Home/SubTypes/useMYSTRAN";
import type { HomeState } from "@/modules/Home/useHome";

const MYSTRAN = (homeState: HomeState) => {
	const { simType, isSubmitting, handleConfiguredSubmit } = homeState;

	const {
		files,
		handleFileChange,
		handleOptionalFileChange,
		handleRemoveFile,
		handleRemoveOptionalFile,
		handleRunSimulation,
		optionalfiles,
	} = useMYSTRAN(handleConfiguredSubmit);

	return (
		<div className="w-full space-y-4">
			<p>Upload a MYSTRAN bulk data model and optional include files.</p>
			<p className="font-semibold text-lg">
				{simulationTypeList.filter((x) => x.value === simType)[0]?.label}
			</p>

			<div className="w-full space-y-4 rounded border border-gray-200 p-2">
				<p>
					This template sends a NASTRAN-style bulk data file plus optional
					includes. Each file must be{" "}
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
					<p className="font-semibold text-lg">Bulk Data File</p>
					<p>
						Upload the model containing mesh, materials, loads, constraints, and
						analysis controls.
					</p>

					<FileUpload
						accept=".bdf,.dat,.nas"
						ariaLabel="MYSTRAN bulk data file"
						disabled={isSubmitting}
						files={files}
						hint="BDF, DAT, or NAS · Up to 5 MB"
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
					<p className="font-semibold text-lg">Include Files</p>
					<p>
						Optional files referenced by INCLUDE cards in the primary model.
					</p>

					<FileUpload
						accept=".bdf,.dat,.nas,.inc"
						ariaLabel="MYSTRAN include files"
						disabled={isSubmitting}
						files={optionalfiles}
						hint="BDF, DAT, NAS, or INC · Up to 5 MB each"
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

export default MYSTRAN;

import { Button } from "@/components/ui/button";
import FileUpload from "@/modules/Home/FileUpload";
import { simulationTypeList } from "@/modules/Home/SimUtils";
import { SelectedFile } from "@/modules/Home/SubTypes/DftFields";
import { useSimpleUploadSubtype } from "@/modules/Home/SubTypes/useSimpleUploadSubtype";
import type { HomeState } from "@/modules/Home/useHome";

const SimpleUploadSubtype = ({
	handleConfiguredSubmit,
	isSubmitting,
	simSubType,
	simType,
}: HomeState) => {
	const { files, handleFileChange, handleRunSimulation, removeFile, uploads } =
		useSimpleUploadSubtype(simSubType, handleConfiguredSubmit);

	return (
		<div className="w-full space-y-4">
			<p>Upload the required input files for this simulator.</p>
			<p className="font-semibold text-lg">
				{simulationTypeList.find((item) => item.value === simType)?.label}
			</p>

			<div className="w-full space-y-4 rounded border border-gray-200 p-2">
				<p>
					Each file must be{" "}
					<strong className="font-semibold text-primary">5 MB</strong> or less.
				</p>

				{uploads.map((upload) => {
					const file = files[upload.fileField];

					return (
						<div
							className="w-full space-y-4 rounded border border-gray-200 p-2"
							key={upload.fileField}
						>
							<p className="font-semibold text-lg">{upload.title}</p>
							<p>{upload.description}</p>
							<FileUpload
								accept={upload.accept}
								ariaLabel={`${upload.title} file`}
								disabled={isSubmitting}
								files={file ? [file] : []}
								hint={upload.hint}
								onChange={(event) => handleFileChange(upload, event)}
							/>
							{file ? (
								<SelectedFile
									ariaLabel={`Remove ${file.name}`}
									file={file}
									onRemove={() => removeFile(upload.fileField)}
								/>
							) : null}
						</div>
					);
				})}
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

export default SimpleUploadSubtype;

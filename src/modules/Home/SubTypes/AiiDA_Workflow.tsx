import { XSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import FileUpload from "@/modules/Home/FileUpload";
import { MAX_FILE_SIZE, simulationTypeList } from "@/modules/Home/SimUtils";

import type { HomeState } from "@/modules/Home/useHome";

// API template: update these values when the AiiDA backend contract is finalized.
const API_TEMPLATE = {
	calculatorSlug: "AiiDA",
	projectPrefix: "HT_aiida",
	simulatorLabel: "AiiDA Workflow",
	primaryFileField: "workflow_file",
	optionalFileField: "input_files",
} as const;

const AiiDA_Workflow = (homeState: HomeState) => {
	const { simType, isSubmitting, handleConfiguredSubmit } = homeState;

	const [files, setFiles] = useState<File[]>([]);
	const [optionalfiles, setOptionalFiles] = useState<File[]>([]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;

		if (!files) return;

		for (const file of Array.from(files)) {
			if (file.size > MAX_FILE_SIZE) {
				toast(`${file.name} must be 5 MB or smaller.`);
				e.target.value = "";
				return;
			}
		}

		const fileArray = Array.from(files);
		setFiles(() => fileArray);
	};

	const handleOptionalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;

		if (!files) return;

		for (const file of Array.from(files)) {
			if (file.size > MAX_FILE_SIZE) {
				toast(`${file.name} must be 5 MB or smaller.`);
				e.target.value = "";
				return;
			}
		}

		const fileArray = Array.from(files);
		setOptionalFiles((prev) => [...prev, ...fileArray]);
	};

	const handleRemoveFile = (fileIndex: number) => {
		setFiles((prevFiles) =>
			prevFiles.filter((_, index) => index !== fileIndex),
		);
	};

	const handleRemoveOptionalFile = (fileIndex: number) => {
		setOptionalFiles((prevFiles) =>
			prevFiles.filter((_, index) => index !== fileIndex),
		);
	};

	const handleRunSimulation = () => {
		if (files.length === 0) {
			toast.error("Upload an AiiDA workflow configuration file.");
			return;
		}

		handleConfiguredSubmit({
			...API_TEMPLATE,
			fileGroups: [
				{ fieldName: API_TEMPLATE.primaryFileField, files },
				{ fieldName: API_TEMPLATE.optionalFileField, files: optionalfiles },
			],
		});
	};

	return (
		<div className="w-full space-y-4">
			<p>Upload an AiiDA workflow definition and its calculator inputs.</p>
			<p className="font-semibold text-lg">
				{simulationTypeList.filter((x) => x.value === simType)[0]?.label}
			</p>

			<div className="w-full space-y-4 rounded border border-gray-200 p-2">
				<p>
					This template sends a workflow configuration plus any supporting AiiDA
					input files. Each file must be{" "}
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
					<p className="font-semibold text-lg">Workflow Configuration</p>
					<p>
						Upload a YAML or JSON workflow definition. Change the accepted
						formats and multipart field in this component when the backend is
						finalized.
					</p>

					<FileUpload
						accept=".yaml,.yml,.json"
						ariaLabel="AiiDA workflow configuration"
						disabled={isSubmitting}
						files={files}
						hint="YAML or JSON · Up to 5 MB"
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
					<p className="font-semibold text-lg">Workflow Input Files</p>
					<p>
						Optional structures, pseudopotentials, metadata, or calculator
						files.
					</p>

					<FileUpload
						ariaLabel="AiiDA workflow input files"
						disabled={isSubmitting}
						files={optionalfiles}
						hint="Structures, pseudopotentials, or metadata · Up to 5 MB each"
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

export default AiiDA_Workflow;

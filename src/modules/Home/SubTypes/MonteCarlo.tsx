import { XSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_FILE_SIZE, simulationTypeList } from "@/modules/Home/SimUtils";
import type { HomeState } from "@/modules/Home/useHome";

// API template: update these values when the Monte Carlo backend contract is finalized.
const API_TEMPLATE = {
	calculatorSlug: "Monte-Carlo",
	projectPrefix: "MC",
	simulatorLabel: "Monte Carlo",
	primaryFileField: "config_file",
	optionalFileField: "data_files",
} as const;

const MonteCarlo = (homeState: HomeState) => {
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

		fileArray.forEach((file) => {
			console.log(file.name);
			console.log(file.type);
			console.log(file.size);
		});
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

		fileArray.forEach((file) => {
			console.log(file.name);
			console.log(file.type);
			console.log(file.size);
		});
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
			toast.error("Upload a Monte Carlo configuration file.");
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

									<Button variant={"ghost"} onClick={() => handleRemoveFile(i)}>
										<XSquare color="red" />
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

					<div>
						<Input
							className="w-full"
							type="file"
							multiple={false}
							accept=".json,.yaml,.yml,.csv"
							onChange={handleFileChange}
						/>
					</div>
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
										variant={"ghost"}
										onClick={() => handleRemoveOptionalFile(i)}
									>
										<XSquare color="red" />
									</Button>
								</div>
							))}
						</div>
					</div>
				)}

				<div className="w-full space-y-4 rounded border border-gray-200 p-2">
					<p className="font-semibold text-lg">Input Datasets</p>
					<p>Optional tabular, structure, or restart data used by the run.</p>

					<div>
						<Input
							className="w-full"
							type="file"
							multiple={true}
							accept=".csv,.json,.txt"
							onChange={handleOptionalFileChange}
						/>
					</div>
				</div>
			</div>

			<Button
				className="my-4 py-4 w-full text-lg"
				disabled={isSubmitting}
				onClick={handleRunSimulation}
			>
				{isSubmitting ? "Submitting Monte Carlo..." : "Run Simulation"}
			</Button>
		</div>
	);
};

export default MonteCarlo;

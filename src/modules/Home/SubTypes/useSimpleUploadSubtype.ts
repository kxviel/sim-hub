import { type ChangeEvent, useState } from "react";
import { toast } from "sonner";
import { MAX_FILE_SIZE } from "@/modules/Home/SimUtils";
import type { HomeState } from "@/modules/Home/useHome";

export type SimpleUploadSubtypeApi = {
	extension: string;
	family: "FEM" | "Others";
	fileField: "femInput" | "simInput";
	projectPrefix: string;
};

export const useSimpleUploadSubtype = (
	simulator: string,
	api: SimpleUploadSubtypeApi,
	handleConfiguredSubmit: HomeState["handleConfiguredSubmit"],
) => {
	const [file, setFile] = useState<File | null>(null);

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0];

		if (!selectedFile) {
			return;
		}

		if (!selectedFile.name.toLowerCase().endsWith(api.extension)) {
			toast.error(
				`${simulator} input must be a ${api.extension.toUpperCase()} file.`,
			);
			event.target.value = "";
			return;
		}

		if (selectedFile.size > MAX_FILE_SIZE) {
			toast.error(`${simulator} input must be 5 MB or smaller.`);
			event.target.value = "";
			return;
		}

		setFile(selectedFile);
		event.target.value = "";
	};

	const removeFile = () => {
		setFile(null);
	};

	const handleRunSimulation = () => {
		if (!file) {
			toast.error(`Upload the ${simulator} input file.`);
			return;
		}

		const codeField = api.family === "FEM" ? "fem_code" : "other_code";

		handleConfiguredSubmit({
			calculatorSlug: simulator,
			projectPrefix: api.projectPrefix,
			simulatorLabel: simulator,
			skipExtraInputs: true,
			formFields: {
				simulation_family: api.family,
				[codeField]: simulator,
			},
			fileGroups: [
				{ fieldName: api.fileField, files: [file] },
				{ fieldName: "input_file", files: [file] },
				{ fieldName: "input_files", files: [file] },
				{ fieldName: "csv_file", files: [file] },
				{ fieldName: "structure_file", files: [file] },
			],
		});
	};

	return {
		file,
		handleFileChange,
		handleRunSimulation,
		removeFile,
	};
};

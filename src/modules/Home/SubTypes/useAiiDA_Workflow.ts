import { type ChangeEvent, useState } from "react";
import { toast } from "sonner";
import { MAX_FILE_SIZE } from "@/modules/Home/SimUtils";
import type { HomeState } from "@/modules/Home/useHome";

// API template: update these values when the AiiDA backend contract is finalized.
const API_TEMPLATE = {
	calculatorSlug: "AiiDA",
	projectPrefix: "HT_aiida",
	simulatorLabel: "AiiDA Workflow",
	primaryFileField: "workflow_file",
	optionalFileField: "input_files",
} as const;

export const useAiiDA_Workflow = (
	handleConfiguredSubmit: HomeState["handleConfiguredSubmit"],
) => {
	const [files, setFiles] = useState<File[]>([]);
	const [optionalfiles, setOptionalFiles] = useState<File[]>([]);

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = event.target.files;

		if (!selectedFiles) {
			return;
		}

		for (const file of Array.from(selectedFiles)) {
			if (file.size > MAX_FILE_SIZE) {
				toast(`${file.name} must be 5 MB or smaller.`);
				event.target.value = "";
				return;
			}
		}

		setFiles(Array.from(selectedFiles));
	};

	const handleOptionalFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = event.target.files;

		if (!selectedFiles) {
			return;
		}

		for (const file of Array.from(selectedFiles)) {
			if (file.size > MAX_FILE_SIZE) {
				toast(`${file.name} must be 5 MB or smaller.`);
				event.target.value = "";
				return;
			}
		}

		const nextFiles = Array.from(selectedFiles);
		setOptionalFiles((currentFiles) => [...currentFiles, ...nextFiles]);
	};

	const handleRemoveFile = (fileIndex: number) => {
		setFiles((currentFiles) =>
			currentFiles.filter((_, index) => index !== fileIndex),
		);
	};

	const handleRemoveOptionalFile = (fileIndex: number) => {
		setOptionalFiles((currentFiles) =>
			currentFiles.filter((_, index) => index !== fileIndex),
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

	return {
		files,
		handleFileChange,
		handleOptionalFileChange,
		handleRemoveFile,
		handleRemoveOptionalFile,
		handleRunSimulation,
		optionalfiles,
	};
};

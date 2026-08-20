import { type ChangeEvent, useState } from "react";
import { toast } from "sonner";
import { MAX_FILE_SIZE } from "@/modules/Home/SimUtils";
import type { HomeState } from "@/modules/Home/useHome";

export type ConfiguredSubtypeApi = {
	calculatorSlug: string;
	localPrototype?: boolean;
	optionalFileField: string;
	primaryFileField: string;
	projectPrefix: string;
	requiredFileMessage: string;
	simulatorLabel: string;
};

export type ConfiguredSubtypeState = {
	handleOptionalFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
	handlePrimaryFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
	handleRunSimulation: () => void;
	optionalFiles: File[];
	primaryFiles: File[];
	removeOptionalFile: (index: number) => void;
	removePrimaryFile: (index: number) => void;
};

const getSelectedFiles = (event: ChangeEvent<HTMLInputElement>) => {
	const files = Array.from(event.target.files ?? []);
	const oversizedFile = files.find((file) => file.size > MAX_FILE_SIZE);

	if (oversizedFile) {
		toast(`${oversizedFile.name} must be 5 MB or smaller.`);
		event.target.value = "";
		return null;
	}

	return files.length > 0 ? files : null;
};

const removeAt = (files: File[], targetIndex: number) =>
	files.filter((_, index) => index !== targetIndex);

export const useConfiguredSubtype = (
	handleConfiguredSubmit: HomeState["handleConfiguredSubmit"],
	api: ConfiguredSubtypeApi,
): ConfiguredSubtypeState => {
	const [primaryFiles, setPrimaryFiles] = useState<File[]>([]);
	const [optionalFiles, setOptionalFiles] = useState<File[]>([]);

	const handlePrimaryFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const files = getSelectedFiles(event);

		if (files) {
			setPrimaryFiles(files);
		}
	};

	const handleOptionalFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const files = getSelectedFiles(event);

		if (files) {
			setOptionalFiles((currentFiles) => [...currentFiles, ...files]);
		}
	};

	const removePrimaryFile = (index: number) => {
		setPrimaryFiles((files) => removeAt(files, index));
	};

	const removeOptionalFile = (index: number) => {
		setOptionalFiles((files) => removeAt(files, index));
	};

	const handleRunSimulation = () => {
		if (primaryFiles.length === 0) {
			toast.error(api.requiredFileMessage);
			return;
		}

		handleConfiguredSubmit({
			calculatorSlug: api.calculatorSlug,
			...(api.localPrototype ? { localPrototype: true } : {}),
			projectPrefix: api.projectPrefix,
			simulatorLabel: api.simulatorLabel,
			fileGroups: [
				{ fieldName: api.primaryFileField, files: primaryFiles },
				{ fieldName: api.optionalFileField, files: optionalFiles },
			],
		});
	};

	return {
		handleOptionalFileChange,
		handlePrimaryFileChange,
		handleRunSimulation,
		optionalFiles,
		primaryFiles,
		removeOptionalFile,
		removePrimaryFile,
	};
};

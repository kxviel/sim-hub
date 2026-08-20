import { type ChangeEvent, useState } from "react";
import { toast } from "sonner";
import type { SimulationRunEndpoint } from "@/modules/Home/home.api";
import { MAX_FILE_SIZE } from "@/modules/Home/SimUtils";
import type { HomeState } from "@/modules/Home/useHome";

type SimpleUploadField = {
	accept: string;
	apiField: "csv_file" | "files" | "structure_file";
	description: string;
	extensions: readonly string[];
	fileField: string;
	hint: string;
	skipSizeLimit?: boolean;
	title: string;
};

type SimpleUploadSubtypeApi = {
	calculatorSlug?: string;
	projectPrefix: string;
	runEndpoint: SimulationRunEndpoint;
	uploads: readonly SimpleUploadField[];
};

const SIMPLE_UPLOADS = {
	sectionproperties: {
		projectPrefix: "FEM_sectionproperties",
		runEndpoint: "csv",
		uploads: [
			{
				accept: ".csv",
				apiField: "csv_file",
				description:
					"Upload the sectionproperties rectangle input as a CSV file.",
				extensions: [".csv"],
				fileField: "femInput",
				hint: "CSV · Up to 5 MB",
				title: "Section Properties Input",
			},
		],
	},
	FEAScript: {
		projectPrefix: "FEM_feascript",
		runEndpoint: "csv",
		uploads: [
			{
				accept: ".csv",
				apiField: "csv_file",
				description:
					"Upload the FEAScript heat conduction input as a CSV file.",
				extensions: [".csv"],
				fileField: "femInput",
				hint: "CSV · Up to 5 MB",
				title: "FEAScript Input",
			},
		],
	},
	new_abaqus: {
		projectPrefix: "FEM_new_abaqus",
		runEndpoint: "file_only",
		uploads: [
			{
				accept: ".inp",
				apiField: "files",
				description: "Upload the new_abaqus model input as an INP file.",
				extensions: [".inp"],
				fileField: "femInput",
				hint: "INP · Up to 5 MB",
				title: "Abaqus Input",
			},
		],
	},
	"JAX-FEM": {
		calculatorSlug: "jaxfem",
		projectPrefix: "FEM_jax-fem",
		runEndpoint: "csv",
		uploads: [
			{
				accept: ".csv",
				apiField: "csv_file",
				description:
					"Upload the JAX-FEM 3D linear Poisson input as a CSV file.",
				extensions: [".csv"],
				fileField: "femInput",
				hint: "CSV · Up to 5 MB",
				title: "JAX-FEM Input",
			},
		],
	},
	"BFE.NET": {
		calculatorSlug: "bfenet",
		projectPrefix: "FEM_bfe_net",
		runEndpoint: "csv",
		uploads: [
			{
				accept: ".csv",
				apiField: "csv_file",
				description:
					"Upload the BFE.NET simple cantilever input as a CSV file.",
				extensions: [".csv"],
				fileField: "femInput",
				hint: "CSV · Up to 5 MB",
				title: "BFE.NET Input",
			},
		],
	},
	FEMWELL: {
		projectPrefix: "FEM_femwell",
		runEndpoint: "csv",
		uploads: [
			{
				accept: ".csv",
				apiField: "csv_file",
				description:
					"Upload the FEMWELL thermal phase shifter input as a CSV file.",
				extensions: [".csv"],
				fileField: "femInput",
				hint: "CSV · Up to 5 MB",
				title: "FEMWELL Input",
			},
		],
	},
	MYSTRAN: {
		projectPrefix: "FEM_mystran",
		runEndpoint: "file_only",
		uploads: [
			{
				accept: ".bdf,.dat,.nas",
				apiField: "files",
				description: "Upload the MYSTRAN model as a BDF, DAT, or NAS file.",
				extensions: [".bdf", ".dat", ".nas"],
				fileField: "femInput",
				hint: "BDF, DAT, or NAS · Up to 5 MB",
				title: "MYSTRAN Bulk Data File",
			},
		],
	},
	STAN: {
		projectPrefix: "FEM_stan",
		runEndpoint: "file_only",
		uploads: [
			{
				accept: ".stdb",
				apiField: "files",
				description: "Upload the STAN input file in STDb format.",
				extensions: [".stdb"],
				fileField: "femInput",
				hint: "STDb",
				skipSizeLimit: true,
				title: "STAN Input",
			},
		],
	},
	MFEM: {
		projectPrefix: "FEM_mfem",
		runEndpoint: "csv",
		uploads: [
			{
				accept: ".csv",
				apiField: "csv_file",
				description: "Upload the MFEM minimal example input as a CSV file.",
				extensions: [".csv"],
				fileField: "femInput",
				hint: "CSV · Up to 5 MB",
				title: "MFEM Input",
			},
			{
				accept: ".mesh",
				apiField: "structure_file",
				description: "Upload the MFEM mesh file.",
				extensions: [".mesh"],
				fileField: "meshFile",
				hint: "MESH · Up to 5 MB",
				title: "MFEM Mesh",
			},
		],
	},
	FEBio: {
		projectPrefix: "FEM_febio",
		runEndpoint: "file_only",
		uploads: [
			{
				accept: ".feb",
				apiField: "files",
				description: "Upload the FEBio model input as a .feb file.",
				extensions: [".feb"],
				fileField: "femInput",
				hint: "FEB · Up to 5 MB",
				title: "FEBio Input",
			},
		],
	},
	"MEEP FDTD": {
		calculatorSlug: "meep",
		projectPrefix: "OTHER_meep",
		runEndpoint: "csv",
		uploads: [
			{
				accept: ".csv",
				apiField: "csv_file",
				description: "Upload the MEEP FDTD input parameters as a CSV file.",
				extensions: [".csv"],
				fileField: "simInput",
				hint: "CSV · Up to 5 MB",
				title: "MEEP Input",
			},
		],
	},
} as const satisfies Record<string, SimpleUploadSubtypeApi>;

const getExtensionLabel = (extensions: readonly string[]) => {
	const labels = extensions.map((extension) =>
		extension.slice(1).toUpperCase(),
	);

	return labels.length > 1
		? `${labels.slice(0, -1).join(", ")}, or ${labels.at(-1)}`
		: labels[0];
};

const hasAllowedExtension = (file: File, extensions: readonly string[]) => {
	const filename = file.name.toLowerCase();
	return extensions.some((extension) => filename.endsWith(extension));
};

export const useSimpleUploadSubtype = (
	simulator: string,
	handleConfiguredSubmit: HomeState["handleConfiguredSubmit"],
) => {
	const api: SimpleUploadSubtypeApi =
		SIMPLE_UPLOADS[simulator as keyof typeof SIMPLE_UPLOADS];
	const [files, setFiles] = useState<Record<string, File>>({});

	const handleFileChange = (
		upload: SimpleUploadField,
		event: ChangeEvent<HTMLInputElement>,
	) => {
		const selectedFile = event.target.files?.[0];

		if (!selectedFile) {
			return;
		}

		if (!hasAllowedExtension(selectedFile, upload.extensions)) {
			toast.error(
				`${upload.title} must be a ${getExtensionLabel(upload.extensions)} file.`,
			);
			event.target.value = "";
			return;
		}

		if (!upload.skipSizeLimit && selectedFile.size > MAX_FILE_SIZE) {
			toast.error(`${upload.title} must be 5 MB or smaller.`);
			event.target.value = "";
			return;
		}

		setFiles((currentFiles) => ({
			...currentFiles,
			[upload.fileField]: selectedFile,
		}));
		event.target.value = "";
	};

	const removeFile = (fieldName: string) => {
		setFiles((currentFiles) => {
			const nextFiles = { ...currentFiles };
			delete nextFiles[fieldName];
			return nextFiles;
		});
	};

	const handleRunSimulation = () => {
		const groupedFiles = new Map<string, File[]>();
		const addFile = (fieldName: string, file: File) => {
			const fieldFiles = groupedFiles.get(fieldName) ?? [];

			if (!fieldFiles.includes(file)) {
				fieldFiles.push(file);
				groupedFiles.set(fieldName, fieldFiles);
			}
		};

		for (const upload of api.uploads) {
			const file = files[upload.fileField];

			if (!file) {
				toast.error(`Upload the ${upload.title} file.`);
				return;
			}

			addFile(upload.apiField, file);
		}

		handleConfiguredSubmit({
			calculatorSlug: api.calculatorSlug ?? simulator,
			projectPrefix: api.projectPrefix,
			runEndpoint: api.runEndpoint,
			simulatorLabel: simulator,
			fileGroups: Array.from(groupedFiles, ([fieldName, grouped]) => ({
				fieldName,
				files: grouped,
			})),
		});
	};

	return {
		files,
		handleFileChange,
		handleRunSimulation,
		removeFile,
		uploads: api.uploads,
	};
};

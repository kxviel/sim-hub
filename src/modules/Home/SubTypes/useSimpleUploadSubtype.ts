import { type ChangeEvent, useState } from "react";
import { toast } from "sonner";
import { MAX_FILE_SIZE } from "@/modules/Home/SimUtils";
import type { HomeState } from "@/modules/Home/useHome";

type SimpleUploadField = {
	accept: string;
	description: string;
	extensions: readonly string[];
	fileField: string;
	hint: string;
	title: string;
};

type SimpleUploadSubtypeApi = {
	calculatorSlug?: string;
	family: "FEM" | "Others";
	projectPrefix: string;
	uploads: readonly SimpleUploadField[];
};

const SIMPLE_UPLOADS = {
	sectionproperties: {
		family: "FEM",
		projectPrefix: "FEM_sectionproperties",
		uploads: [
			{
				accept: ".csv",
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
		family: "FEM",
		projectPrefix: "FEM_feascript",
		uploads: [
			{
				accept: ".csv",
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
		family: "FEM",
		projectPrefix: "FEM_new_abaqus",
		uploads: [
			{
				accept: ".inp",
				description: "Upload the new_abaqus model input as an INP file.",
				extensions: [".inp"],
				fileField: "femInput",
				hint: "INP · Up to 5 MB",
				title: "Abaqus Input",
			},
		],
	},
	"JAX-FEM": {
		family: "FEM",
		projectPrefix: "FEM_jax-fem",
		uploads: [
			{
				accept: ".csv",
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
		family: "FEM",
		projectPrefix: "FEM_bfe_net",
		uploads: [
			{
				accept: ".csv",
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
		family: "FEM",
		projectPrefix: "FEM_femwell",
		uploads: [
			{
				accept: ".csv",
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
		family: "FEM",
		projectPrefix: "FEM_mystran",
		uploads: [
			{
				accept: ".bdf,.dat,.nas",
				description: "Upload the MYSTRAN model as a BDF, DAT, or NAS file.",
				extensions: [".bdf", ".dat", ".nas"],
				fileField: "femInput",
				hint: "BDF, DAT, or NAS · Up to 5 MB",
				title: "MYSTRAN Bulk Data File",
			},
		],
	},
	STAN: {
		family: "FEM",
		projectPrefix: "FEM_stan",
		uploads: [
			{
				accept: ".zip",
				description: "Upload the STAN input package as a ZIP file.",
				extensions: [".zip"],
				fileField: "femInput",
				hint: "ZIP · Up to 5 MB",
				title: "STAN Input Package",
			},
		],
	},
	MFEM: {
		family: "FEM",
		projectPrefix: "FEM_mfem",
		uploads: [
			{
				accept: ".csv",
				description: "Upload the MFEM minimal example input as a CSV file.",
				extensions: [".csv"],
				fileField: "femInput",
				hint: "CSV · Up to 5 MB",
				title: "MFEM Input",
			},
			{
				accept: ".mesh",
				description: "Upload the MFEM mesh file.",
				extensions: [".mesh"],
				fileField: "meshFile",
				hint: "MESH · Up to 5 MB",
				title: "MFEM Mesh",
			},
		],
	},
	FEBio: {
		family: "FEM",
		projectPrefix: "FEM_febio",
		uploads: [
			{
				accept: ".feb",
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
		family: "Others",
		projectPrefix: "OTHER_meep",
		uploads: [
			{
				accept: ".csv",
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

		if (selectedFile.size > MAX_FILE_SIZE) {
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
		const selectedFiles: File[] = [];
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

			selectedFiles.push(file);
			addFile(upload.fileField, file);
			addFile("input_file", file);
			addFile("input_files", file);
			addFile("files", file);

			if (file.name.toLowerCase().endsWith(".csv")) {
				addFile("csv_file", file);
			}

			if (file.name.toLowerCase().endsWith(".json")) {
				addFile("json_file", file);
			}
		}

		const firstFile = selectedFiles[0];

		if (api.family === "FEM" && firstFile) {
			addFile("csv_file", firstFile);
			addFile("structure_file", firstFile);
		}

		const codeField = api.family === "FEM" ? "fem_code" : "other_code";

		handleConfiguredSubmit({
			calculatorSlug: api.calculatorSlug ?? simulator,
			projectPrefix: api.projectPrefix,
			runEndpoint: api.family === "FEM" ? "file_only" : "csv",
			simulatorLabel: simulator,
			formFields: {
				simulation_family: api.family,
				[codeField]: simulator,
			},
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

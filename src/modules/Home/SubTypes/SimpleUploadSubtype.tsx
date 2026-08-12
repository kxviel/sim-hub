import { Button } from "@/components/ui/button";
import FileUpload from "@/modules/Home/FileUpload";
import { simulationTypeList } from "@/modules/Home/SimUtils";
import { SelectedFile } from "@/modules/Home/SubTypes/DftFields";
import {
	type SimpleUploadSubtypeApi,
	useSimpleUploadSubtype,
} from "@/modules/Home/SubTypes/useSimpleUploadSubtype";
import type { HomeState } from "@/modules/Home/useHome";

type SimpleUploadDefinition = SimpleUploadSubtypeApi & {
	accept: string;
	description: string;
	hint: string;
	title: string;
};

const SIMPLE_UPLOADS = {
	sectionproperties: {
		accept: ".csv",
		description: "Upload the sectionproperties rectangle input as a CSV file.",
		extension: ".csv",
		family: "FEM",
		fileField: "femInput",
		hint: "CSV · Up to 5 MB",
		projectPrefix: "FEM_sectionproperties",
		title: "Section Properties Input",
	},
	FEAScript: {
		accept: ".csv",
		description: "Upload the FEAScript heat conduction input as a CSV file.",
		extension: ".csv",
		family: "FEM",
		fileField: "femInput",
		hint: "CSV · Up to 5 MB",
		projectPrefix: "FEM_feascript",
		title: "FEAScript Input",
	},
	new_abaqus: {
		accept: ".inp",
		description: "Upload the new_abaqus model input as an INP file.",
		extension: ".inp",
		family: "FEM",
		fileField: "femInput",
		hint: "INP · Up to 5 MB",
		projectPrefix: "FEM_new_abaqus",
		title: "Abaqus Input",
	},
	"JAX-FEM": {
		accept: ".csv",
		description: "Upload the JAX-FEM 3D linear Poisson input as a CSV file.",
		extension: ".csv",
		family: "FEM",
		fileField: "femInput",
		hint: "CSV · Up to 5 MB",
		projectPrefix: "FEM_jax-fem",
		title: "JAX-FEM Input",
	},
	"BFE.NET": {
		accept: ".csv",
		description: "Upload the BFE.NET simple cantilever input as a CSV file.",
		extension: ".csv",
		family: "FEM",
		fileField: "femInput",
		hint: "CSV · Up to 5 MB",
		projectPrefix: "FEM_bfe_net",
		title: "BFE.NET Input",
	},
	FEMWELL: {
		accept: ".csv",
		description:
			"Upload the FEMWELL thermal phase shifter input as a CSV file.",
		extension: ".csv",
		family: "FEM",
		fileField: "femInput",
		hint: "CSV · Up to 5 MB",
		projectPrefix: "FEM_femwell",
		title: "FEMWELL Input",
	},
	MYSTRAN: {
		accept: ".bdf",
		description: "Upload the MYSTRAN model as a BDF file.",
		extension: ".bdf",
		family: "FEM",
		fileField: "femInput",
		hint: "BDF · Up to 5 MB",
		projectPrefix: "FEM_mystran",
		title: "MYSTRAN Bulk Data File",
	},
	STAN: {
		accept: ".zip",
		description: "Upload the STAN input package as a ZIP file.",
		extension: ".zip",
		family: "FEM",
		fileField: "femInput",
		hint: "ZIP · Up to 5 MB",
		projectPrefix: "FEM_stan",
		title: "STAN Input Package",
	},
	MFEM: {
		accept: ".csv",
		description: "Upload the MFEM minimal example input as a CSV file.",
		extension: ".csv",
		family: "FEM",
		fileField: "femInput",
		hint: "CSV · Up to 5 MB",
		projectPrefix: "FEM_mfem",
		title: "MFEM Input",
	},
	FEBio: {
		accept: ".feb",
		description: "Upload the FEBio model input as a FEB XML file.",
		extension: ".feb",
		family: "FEM",
		fileField: "femInput",
		hint: "FEB · Up to 5 MB",
		projectPrefix: "FEM_febio",
		title: "FEBio Input",
	},
	"MEEP FDTD": {
		accept: ".csv",
		description: "Upload the MEEP FDTD input parameters as a CSV file.",
		extension: ".csv",
		family: "Others",
		fileField: "simInput",
		hint: "CSV · Up to 5 MB",
		projectPrefix: "OTHER_meep_fdtd",
		title: "MEEP Input",
	},
} as const satisfies Record<string, SimpleUploadDefinition>;

const SimpleUploadSubtype = ({
	handleConfiguredSubmit,
	isSubmitting,
	simSubType,
	simType,
}: HomeState) => {
	const upload = SIMPLE_UPLOADS[simSubType as keyof typeof SIMPLE_UPLOADS];
	const { file, handleFileChange, handleRunSimulation, removeFile } =
		useSimpleUploadSubtype(simSubType, upload, handleConfiguredSubmit);

	return (
		<div className="w-full space-y-4">
			<p>Upload the required input file for this simulator.</p>
			<p className="font-semibold text-lg">
				{simulationTypeList.find((item) => item.value === simType)?.label}
			</p>

			<div className="w-full space-y-4 rounded border border-gray-200 p-2">
				<p>
					Each file must be{" "}
					<strong className="font-semibold text-primary">5 MB</strong> or less.
				</p>

				<div className="w-full space-y-4 rounded border border-gray-200 p-2">
					<p className="font-semibold text-lg">{upload.title}</p>
					<p>{upload.description}</p>
					<FileUpload
						accept={upload.accept}
						ariaLabel={`${simSubType} input file`}
						disabled={isSubmitting}
						files={file ? [file] : []}
						hint={upload.hint}
						onChange={handleFileChange}
					/>
					{file ? (
						<SelectedFile
							ariaLabel={`Remove ${file.name}`}
							file={file}
							onRemove={removeFile}
						/>
					) : null}
				</div>
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

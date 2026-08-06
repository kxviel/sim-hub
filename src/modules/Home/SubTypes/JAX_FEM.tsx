import {
	ConfiguredSubtype,
	type ConfiguredSubtypeCopy,
} from "@/modules/Home/SubTypes/ConfiguredSubtype";
import { useJAX_FEM } from "@/modules/Home/SubTypes/useJAX_FEM";
import type { HomeState } from "@/modules/Home/useHome";

const COPY: ConfiguredSubtypeCopy = {
	intro: "Upload a JAX-FEM model configuration and its mesh files.",
	summary:
		"This template sends one model configuration plus optional FEM mesh files.",
	primary: {
		title: "Model Configuration",
		description:
			"Upload the governing-equation, material, solver, and boundary-condition configuration.",
		accept: ".py,.json,.yaml,.yml",
		ariaLabel: "JAX-FEM model definition",
		hint: "Python, JSON, or YAML · Up to 5 MB",
	},
	optional: {
		title: "Mesh Files",
		description:
			"Optional meshes and field data consumed by the JAX-FEM model.",
		accept: ".msh,.vtk,.vtu,.xdmf",
		ariaLabel: "JAX-FEM mesh and field files",
		hint: "MSH, VTK, VTU, or XDMF · Up to 5 MB each",
	},
};

const JAX_FEM = ({
	simType,
	isSubmitting,
	handleConfiguredSubmit,
}: HomeState) => {
	const subtypeState = useJAX_FEM(handleConfiguredSubmit);

	return (
		<ConfiguredSubtype
			{...subtypeState}
			copy={COPY}
			isSubmitting={isSubmitting}
			simType={simType}
		/>
	);
};

export default JAX_FEM;

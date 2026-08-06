import {
	ConfiguredSubtype,
	type ConfiguredSubtypeCopy,
} from "@/modules/Home/SubTypes/ConfiguredSubtype";
import { useMEEP_FDTD } from "@/modules/Home/SubTypes/useMEEP_FDTD";
import type { HomeState } from "@/modules/Home/useHome";

const COPY: ConfiguredSubtypeCopy = {
	intro: "Upload a MEEP simulation definition and optional material data.",
	summary:
		"This template sends the FDTD simulation definition plus optional geometry or material datasets.",
	primary: {
		title: "Simulation Definition",
		description:
			"Upload a Python, Scheme control, JSON, or YAML simulation definition.",
		accept: ".py,.ctl,.json,.yaml,.yml",
		ariaLabel: "MEEP simulation definition",
		hint: "Python, CTL, JSON, or YAML · Up to 5 MB",
	},
	optional: {
		title: "Material and Geometry Files",
		description:
			"Optional HDF5, JSON, or tabular data referenced by the simulation.",
		accept: ".h5,.hdf5,.json,.csv",
		ariaLabel: "MEEP material and field files",
		hint: "HDF5, JSON, or CSV · Up to 5 MB each",
	},
};

const MEEP_FDTD = ({
	simType,
	isSubmitting,
	handleConfiguredSubmit,
}: HomeState) => {
	const subtypeState = useMEEP_FDTD(handleConfiguredSubmit);

	return (
		<ConfiguredSubtype
			{...subtypeState}
			copy={COPY}
			isSubmitting={isSubmitting}
			simType={simType}
		/>
	);
};

export default MEEP_FDTD;

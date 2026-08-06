import {
	ConfiguredSubtype,
	type ConfiguredSubtypeCopy,
} from "@/modules/Home/SubTypes/ConfiguredSubtype";
import { useASE } from "@/modules/Home/SubTypes/useASE";
import type { HomeState } from "@/modules/Home/useHome";

const COPY: ConfiguredSubtypeCopy = {
	intro: "Upload an ASE script or atomic structure and calculator inputs.",
	summary:
		"This template sends one primary ASE input plus optional calculator files.",
	primary: {
		title: "ASE Script or Structure",
		description:
			"Upload a Python script or structure file used to construct the ASE Atoms object.",
		accept: ".py,.cif,.xyz,.json",
		ariaLabel: "ASE script or structure",
		hint: "Python, CIF, XYZ, or JSON · Up to 5 MB",
	},
	optional: {
		title: "Calculator Input Files",
		description:
			"Optional files required by the selected ASE calculator backend.",
		ariaLabel: "ASE calculator input files",
		hint: "Additional calculator files · Up to 5 MB each",
	},
};

const ASE = ({ simType, isSubmitting, handleConfiguredSubmit }: HomeState) => {
	const subtypeState = useASE(handleConfiguredSubmit);

	return (
		<ConfiguredSubtype
			{...subtypeState}
			copy={COPY}
			isSubmitting={isSubmitting}
			simType={simType}
		/>
	);
};

export default ASE;

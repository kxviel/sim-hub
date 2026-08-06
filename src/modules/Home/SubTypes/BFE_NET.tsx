import {
	ConfiguredSubtype,
	type ConfiguredSubtypeCopy,
} from "@/modules/Home/SubTypes/ConfiguredSubtype";
import { useBFE_NET } from "@/modules/Home/SubTypes/useBFE_NET";
import type { HomeState } from "@/modules/Home/useHome";

const COPY: ConfiguredSubtypeCopy = {
	intro: "Upload a BFE.NET cantilever model definition and supporting data.",
	summary:
		"This API template sends one model definition and optional supporting files.",
	primary: {
		title: "Model Definition",
		description:
			"Upload the cantilever geometry, material, load, and boundary-condition definition expected by the backend.",
		accept: ".json,.xml,.txt",
		ariaLabel: "BFE.NET model definition",
		hint: "JSON, XML, or text · Up to 5 MB",
	},
	optional: {
		title: "Supporting Files",
		description: "Optional mesh, material-library, or additional model files.",
		ariaLabel: "BFE.NET supporting files",
		hint: "Meshes, materials, or supporting models · Up to 5 MB each",
	},
};

const BFE_NET = ({
	simType,
	isSubmitting,
	handleConfiguredSubmit,
}: HomeState) => {
	const subtypeState = useBFE_NET(handleConfiguredSubmit);

	return (
		<ConfiguredSubtype
			{...subtypeState}
			copy={COPY}
			isSubmitting={isSubmitting}
			simType={simType}
		/>
	);
};

export default BFE_NET;

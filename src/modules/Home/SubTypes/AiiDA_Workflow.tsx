import {
	ConfiguredSubtype,
	type ConfiguredSubtypeCopy,
} from "@/modules/Home/SubTypes/ConfiguredSubtype";
import { useAiiDA_Workflow } from "@/modules/Home/SubTypes/useAiiDA_Workflow";
import type { HomeState } from "@/modules/Home/useHome";

const COPY: ConfiguredSubtypeCopy = {
	intro: "Upload an AiiDA workflow definition and its calculator inputs.",
	summary:
		"This template sends a workflow configuration plus any supporting AiiDA input files.",
	primary: {
		title: "Workflow Configuration",
		description:
			"Upload a YAML or JSON workflow definition. Change the accepted formats and multipart field in this component when the backend is finalized.",
		accept: ".yaml,.yml,.json",
		ariaLabel: "AiiDA workflow configuration",
		hint: "YAML or JSON · Up to 5 MB",
	},
	optional: {
		title: "Workflow Input Files",
		description:
			"Optional structures, pseudopotentials, metadata, or calculator files.",
		ariaLabel: "AiiDA workflow input files",
		hint: "Structures, pseudopotentials, or metadata · Up to 5 MB each",
	},
};

const AiiDA_Workflow = ({
	simType,
	isSubmitting,
	handleConfiguredSubmit,
}: HomeState) => {
	const subtypeState = useAiiDA_Workflow(handleConfiguredSubmit);

	return (
		<ConfiguredSubtype
			{...subtypeState}
			copy={COPY}
			isSubmitting={isSubmitting}
			simType={simType}
		/>
	);
};

export default AiiDA_Workflow;

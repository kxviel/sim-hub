import {
	ConfiguredSubtype,
	type ConfiguredSubtypeCopy,
} from "@/modules/Home/SubTypes/ConfiguredSubtype";
import { useMonteCarlo } from "@/modules/Home/SubTypes/useMonteCarlo";
import type { HomeState } from "@/modules/Home/useHome";

const COPY: ConfiguredSubtypeCopy = {
	intro: "Upload a Monte Carlo configuration and optional input datasets.",
	summary:
		"This generic template is intentionally backend-neutral because the ODP does not define a Monte Carlo simulator contract.",
	primary: {
		title: "Run Configuration",
		description:
			"Upload the sampling, seed, step-count, and model configuration expected by the future backend.",
		accept: ".json,.yaml,.yml,.csv",
		ariaLabel: "Monte Carlo configuration",
		hint: "JSON, YAML, or CSV · Up to 5 MB",
	},
	optional: {
		title: "Input Datasets",
		description:
			"Optional tabular, structure, or restart data used by the run.",
		accept: ".csv,.json,.txt",
		ariaLabel: "Monte Carlo supporting data",
		hint: "CSV, JSON, or text · Up to 5 MB each",
	},
};

const MonteCarlo = ({
	simType,
	isSubmitting,
	handleConfiguredSubmit,
}: HomeState) => {
	const subtypeState = useMonteCarlo(handleConfiguredSubmit);

	return (
		<ConfiguredSubtype
			{...subtypeState}
			copy={COPY}
			isSubmitting={isSubmitting}
			simType={simType}
		/>
	);
};

export default MonteCarlo;

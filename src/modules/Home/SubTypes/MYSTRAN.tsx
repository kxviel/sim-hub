import {
	ConfiguredSubtype,
	type ConfiguredSubtypeCopy,
} from "@/modules/Home/SubTypes/ConfiguredSubtype";
import { useMYSTRAN } from "@/modules/Home/SubTypes/useMYSTRAN";
import type { HomeState } from "@/modules/Home/useHome";

const COPY: ConfiguredSubtypeCopy = {
	intro: "Upload a MYSTRAN bulk data model and optional include files.",
	summary:
		"This template sends a NASTRAN-style bulk data file plus optional includes.",
	primary: {
		title: "Bulk Data File",
		description:
			"Upload the model containing mesh, materials, loads, constraints, and analysis controls.",
		accept: ".bdf,.dat,.nas",
		ariaLabel: "MYSTRAN bulk data file",
		hint: "BDF, DAT, or NAS · Up to 5 MB",
	},
	optional: {
		title: "Include Files",
		description:
			"Optional files referenced by INCLUDE cards in the primary model.",
		accept: ".bdf,.dat,.nas,.inc",
		ariaLabel: "MYSTRAN include files",
		hint: "BDF, DAT, NAS, or INC · Up to 5 MB each",
	},
};

const MYSTRAN = ({
	simType,
	isSubmitting,
	handleConfiguredSubmit,
}: HomeState) => {
	const subtypeState = useMYSTRAN(handleConfiguredSubmit);

	return (
		<ConfiguredSubtype
			{...subtypeState}
			copy={COPY}
			isSubmitting={isSubmitting}
			simType={simType}
		/>
	);
};

export default MYSTRAN;

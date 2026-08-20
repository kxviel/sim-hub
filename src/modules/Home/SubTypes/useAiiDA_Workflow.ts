import {
	type ConfiguredSubtypeApi,
	useConfiguredSubtype,
} from "@/modules/Home/SubTypes/useConfiguredSubtype";
import type { HomeState } from "@/modules/Home/useHome";

// API template: update these values when the AiiDA backend contract is finalized.
const API_TEMPLATE = {
	calculatorSlug: "AiiDA",
	localPrototype: true,
	projectPrefix: "HT_aiida",
	simulatorLabel: "AiiDA Workflow",
	primaryFileField: "workflow_file",
	optionalFileField: "input_files",
	requiredFileMessage: "Upload an AiiDA workflow configuration file.",
} satisfies ConfiguredSubtypeApi;

export const useAiiDA_Workflow = (
	handleConfiguredSubmit: HomeState["handleConfiguredSubmit"],
) => useConfiguredSubtype(handleConfiguredSubmit, API_TEMPLATE);

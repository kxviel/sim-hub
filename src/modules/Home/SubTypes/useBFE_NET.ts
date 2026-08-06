import {
	type ConfiguredSubtypeApi,
	useConfiguredSubtype,
} from "@/modules/Home/SubTypes/useConfiguredSubtype";
import type { HomeState } from "@/modules/Home/useHome";

// API template: update these values when the BFE.NET backend contract is finalized.
const API_TEMPLATE = {
	calculatorSlug: "BFE.NET",
	projectPrefix: "FEM_bfe_net",
	simulatorLabel: "BFE.NET - Cantilever Beam",
	primaryFileField: "model_file",
	optionalFileField: "additional_files",
	requiredFileMessage: "Upload a BFE.NET model definition.",
} satisfies ConfiguredSubtypeApi;

export const useBFE_NET = (
	handleConfiguredSubmit: HomeState["handleConfiguredSubmit"],
) => useConfiguredSubtype(handleConfiguredSubmit, API_TEMPLATE);

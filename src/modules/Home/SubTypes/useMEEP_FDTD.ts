import {
	type ConfiguredSubtypeApi,
	useConfiguredSubtype,
} from "@/modules/Home/SubTypes/useConfiguredSubtype";
import type { HomeState } from "@/modules/Home/useHome";

// API template: update these values when the MEEP backend contract is finalized.
const API_TEMPLATE = {
	calculatorSlug: "MEEP",
	projectPrefix: "FDTD_meep",
	simulatorLabel: "MEEP FDTD",
	primaryFileField: "simulation_file",
	optionalFileField: "material_files",
	requiredFileMessage: "Upload a MEEP simulation definition.",
} satisfies ConfiguredSubtypeApi;

export const useMEEP_FDTD = (
	handleConfiguredSubmit: HomeState["handleConfiguredSubmit"],
) => useConfiguredSubtype(handleConfiguredSubmit, API_TEMPLATE);

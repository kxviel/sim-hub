import {
	type ConfiguredSubtypeApi,
	useConfiguredSubtype,
} from "@/modules/Home/SubTypes/useConfiguredSubtype";
import type { HomeState } from "@/modules/Home/useHome";

// API template: update these values when the ASE backend contract is finalized.
const API_TEMPLATE = {
	calculatorSlug: "ASE",
	projectPrefix: "HT_ase",
	simulatorLabel: "ASE",
	primaryFileField: "input_file",
	optionalFileField: "additional_files",
	requiredFileMessage: "Upload an ASE script or structure file.",
} satisfies ConfiguredSubtypeApi;

export const useASE = (
	handleConfiguredSubmit: HomeState["handleConfiguredSubmit"],
) => useConfiguredSubtype(handleConfiguredSubmit, API_TEMPLATE);

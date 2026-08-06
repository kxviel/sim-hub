import {
	type ConfiguredSubtypeApi,
	useConfiguredSubtype,
} from "@/modules/Home/SubTypes/useConfiguredSubtype";
import type { HomeState } from "@/modules/Home/useHome";

// API template: update these values when the MYSTRAN backend contract is finalized.
const API_TEMPLATE = {
	calculatorSlug: "MYSTRAN",
	projectPrefix: "FEM_mystran",
	simulatorLabel: "MYSTRAN",
	primaryFileField: "bulk_data_file",
	optionalFileField: "include_files",
	requiredFileMessage: "Upload a MYSTRAN bulk data file.",
} satisfies ConfiguredSubtypeApi;

export const useMYSTRAN = (
	handleConfiguredSubmit: HomeState["handleConfiguredSubmit"],
) => useConfiguredSubtype(handleConfiguredSubmit, API_TEMPLATE);

import {
	type ConfiguredSubtypeApi,
	useConfiguredSubtype,
} from "@/modules/Home/SubTypes/useConfiguredSubtype";
import type { HomeState } from "@/modules/Home/useHome";

// API template: update these values when the Monte Carlo backend contract is finalized.
const API_TEMPLATE = {
	calculatorSlug: "Monte-Carlo",
	projectPrefix: "MC",
	simulatorLabel: "Monte Carlo",
	primaryFileField: "config_file",
	optionalFileField: "data_files",
	requiredFileMessage: "Upload a Monte Carlo configuration file.",
} satisfies ConfiguredSubtypeApi;

export const useMonteCarlo = (
	handleConfiguredSubmit: HomeState["handleConfiguredSubmit"],
) => useConfiguredSubtype(handleConfiguredSubmit, API_TEMPLATE);

import {
	type ConfiguredSubtypeApi,
	useConfiguredSubtype,
} from "@/modules/Home/SubTypes/useConfiguredSubtype";
import type { HomeState } from "@/modules/Home/useHome";

// API template: update these values when the JAX-FEM backend contract is finalized.
const API_TEMPLATE = {
	calculatorSlug: "JAX-FEM",
	projectPrefix: "FEM_jax_fem",
	simulatorLabel: "JAX-FEM",
	primaryFileField: "model_file",
	optionalFileField: "mesh_files",
	requiredFileMessage: "Upload a JAX-FEM model configuration.",
} satisfies ConfiguredSubtypeApi;

export const useJAX_FEM = (
	handleConfiguredSubmit: HomeState["handleConfiguredSubmit"],
) => useConfiguredSubtype(handleConfiguredSubmit, API_TEMPLATE);

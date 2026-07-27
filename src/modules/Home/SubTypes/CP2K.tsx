import SimulatorParameterForm from "@/modules/Home/SubTypes/SimulatorParameterForm";
import type { HomeState } from "@/modules/Home/useHome";

const CP2K = (homeState: HomeState) => {
	if (!homeState.simulatorConfig) return null;

	return (
		<SimulatorParameterForm
			{...homeState}
			config={homeState.simulatorConfig}
		/>
	);
};

export default CP2K;

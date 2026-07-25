import { Terminal } from "lucide-react";
import SectionTitle from "@/modules/Home/SectionTitle";
import { simulationParameterComponents } from "@/modules/Home/SimUtils";
import type { HomeState } from "@/modules/Home/useHome";

const SimulationParams = (homeState: HomeState) => {
	const { simType, simSubType, setupComplete, handleParamSubmit } = homeState;

	const ParameterComponent = simulationParameterComponents[simSubType];

	return (
		<div className="flex-1/4 rounded border border-gray-200 bg-white p-6 space-y-4">
			<SectionTitle title="Simulation Parameters" icon={<Terminal />} />

			{setupComplete && ParameterComponent ? (
				<ParameterComponent {...homeState} />
			) : (
				<div className="w-full">
					<p className="font-semibold text-lg">
						Select a simulation type and subtype to configure parameters.
					</p>
				</div>
			)}
		</div>
	);
};

export default SimulationParams;

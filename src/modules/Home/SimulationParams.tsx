import { Terminal } from "lucide-react";
import AdvancedExecutionOptions from "@/modules/Home/AdvancedExecutionOptions";
import SectionTitle from "@/modules/Home/SectionTitle";
import { simulationParameterComponents } from "@/modules/Home/SimUtils";
import type { HomeState } from "@/modules/Home/useHome";

const SimulationParams = (homeState: HomeState) => {
	const { simSubType, setupComplete } = homeState;

	const ParameterComponent = simulationParameterComponents[simSubType];

	return (
		<div className="h-full min-h-0 w-full space-y-4 overflow-y-auto overscroll-contain rounded border border-gray-200 bg-white p-4 sm:p-6">
			<SectionTitle title="Simulation Parameters" icon={<Terminal />} />

			{setupComplete && ParameterComponent ? (
				<>
					<AdvancedExecutionOptions {...homeState} />
					<ParameterComponent key={simSubType} {...homeState} />
				</>
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

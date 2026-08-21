import { Terminal } from "lucide-react";
import AdvancedExecutionOptions from "@/modules/Home/AdvancedExecutionOptions";
import SectionTitle from "@/modules/Home/SectionTitle";
import { simulationParameterComponents } from "@/modules/Home/SimUtils";
import type { HomeState } from "@/modules/Home/useHome";

const SimulationParams = (homeState: HomeState) => {
	const { simSubType, setupComplete } = homeState;

	const ParameterComponent = simulationParameterComponents[simSubType];

	return (
		<div className="workspace-panel space-y-4">
			<SectionTitle title="Simulation Parameters" icon={<Terminal />} />

			{setupComplete && ParameterComponent ? (
				<>
					<AdvancedExecutionOptions {...homeState} />
					<ParameterComponent key={simSubType} {...homeState} />
				</>
			) : (
				<div className="w-full pt-1">
					<p className="max-w-2xl text-muted-foreground text-sm leading-relaxed">
						Select a simulation type and subtype to configure parameters.
					</p>
				</div>
			)}
		</div>
	);
};

export default SimulationParams;

import { ScrollText } from "lucide-react";
import SectionTitle from "@/modules/Home/SectionTitle";
import type { HomeState } from "@/modules/Home/useHome";

const SimulationResults = (homeState: HomeState) => {
	const {
		// simType,
		results,
		// simSubType,
		// setupComplete,
		// simulationSubtypeList,
		// handleSimulationTypeChange,
		// handleSimulationSubtypeChange,
		// handleParamSubmit,
	} = homeState;

	return (
		<div className="h-full min-h-0 w-full space-y-4 overflow-y-auto rounded border border-gray-200 bg-white p-6">
			<SectionTitle title="Simulation Results" icon={<ScrollText />} />

			{results?.[0] ? (
				<p>Results</p>
			) : (
				<p>Results will appear here after running the simulation</p>
			)}
		</div>
	);
};

export default SimulationResults;

import { Button } from "@base-ui/react/button";
import { Terminal } from "lucide-react";
import SectionTitle from "@/modules/Home/SectionTitle";
import type { HomeState } from "@/modules/Home/useHome";

const SimulationParams = (homeState: HomeState) => {
	const {
		simType,
		// simSubType,
		setupComplete,
		// simulationSubtypeList,
		// handleSimulationTypeChange,
		// handleSimulationSubtypeChange,
		handleParamSubmit,
	} = homeState;

	return (
		<div className="flex-1/4 rounded border border-gray-200 bg-white p-6 space-y-4">
			<SectionTitle title="Simulation Parameters" icon={<Terminal />} />

			{setupComplete ? (
				<div className="w-full space-y-4">
					<p>Set the required parameters or upload input files.</p>
					<p className="font-semibold text-lg">{simType}</p>

					<Button onClick={handleParamSubmit}></Button>
				</div>
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

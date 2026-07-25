import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionTitle from "@/modules/Home/SectionTitle";
import { simulationParameterComponents } from "@/modules/Home/SimUtils";
import { type HomeState, simulationTypeList } from "@/modules/Home/useHome";

const SimulationParams = (homeState: HomeState) => {
	const {
		simType,
		simSubType,
		setupComplete,
		// simulationSubtypeList,
		// handleSimulationTypeChange,
		// handleSimulationSubtypeChange,
		handleParamSubmit,
	} = homeState;

	const ParameterComponent = simulationParameterComponents[simSubType];

	return (
		<div className="flex-1/4 rounded border border-gray-200 bg-white p-6 space-y-4">
			<SectionTitle title="Simulation Parameters" icon={<Terminal />} />

			{setupComplete && ParameterComponent ? (
				<div className="w-full space-y-4">
					<p>Set the required parameters or upload input files.</p>
					<p className="font-semibold text-lg">
						{simulationTypeList.filter((x) => x.value === simType)[0]?.label}
					</p>

					<ParameterComponent {...homeState} />

					<Button
						className="my-4 py-4 w-full text-lg"
						onClick={handleParamSubmit}
					>
						Run Simulation
					</Button>
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

import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SectionTitle from "@/modules/Home/SectionTitle";
import { type HomeState, simulationTypeList } from "@/modules/Home/useHome";

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
					<p className="font-semibold text-lg">
						{simulationTypeList.filter((x) => x.value === simType)[0]?.label}
					</p>

					<div className="w-full space-y-4 rounded border border-gray-200 p-2">
						<p>
							Upload the required CSV parameter file and CIF structure file.
							After the CIF is uploaded, detected elements appear below for
							optional per-element UPF upload. Each file must be{" "}
							<strong className="text-primary font-semibold">5 MB</strong> or
							less.
						</p>

						<div className="w-full space-y-4 rounded border border-gray-200 p-2">
							<p className="font-semibold text-lg">Input Parameters</p>
							<p>
								Upload the Quantum ESPRESSO input parameters as a{" "}
								<strong className="text-primary font-semibold">CSV</strong>{" "}
								file.
							</p>

							<div className="flex items-center gap-4">
								<Button className="w-[50%]">Download Template</Button>
								<Input
									className="w-[50%]"
									// defaultValue={parameter.value}
									type={"file"}
								/>
							</div>
						</div>

						<div className="w-full space-y-4 rounded border border-gray-200 p-2">
							<p className="font-semibold text-lg">Psuedopotential Files</p>
							<p>
								Optional: upload one UPF file for each chemical element used,
								for example Au.UPF and Si.UPF
							</p>

							<div className="flex items-center gap-4">
								<Button className="w-[50%]">Download Template</Button>
								<Input
									className="w-[50%]"
									placeholder="Upload File"
									// defaultValue={parameter.value}
									type={"file"}
								/>
							</div>
						</div>
					</div>

					<Button className="my-4 py-6 w-full" onClick={handleParamSubmit}>
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

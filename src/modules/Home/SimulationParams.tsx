import { Terminal } from "lucide-react";
import SectionTitle from "@/modules/Home/SectionTitle";

const SimulationParams = () => {
	return (
		<div className="flex-1/4 rounded border border-gray-200 bg-white p-6 space-y-4">
			<SectionTitle title="Simulation Parameters" icon={<Terminal />} />
		</div>
	);
};

export default SimulationParams;

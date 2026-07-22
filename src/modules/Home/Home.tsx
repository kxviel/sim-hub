import { Ghost } from "lucide-react";
import SimulationParams from "@/modules/Home/SimulationParams";
import SimulationResults from "@/modules/Home/SimulationResults";
import SimulationSetup from "@/modules/Home/SimulationSetup";

const SectionTitle = ({ title }: { title: string }) => {
	return (
		<div className="flex items-center gap-2">
			<div className="p-2 bg-primary-foreground border border-primary rounded">
				<Ghost />
			</div>
			<p className="text-base text-primary">Simulation Setup</p>
		</div>
	);
};

const Home = () => {
	return (
		<section className="flex h-full min-h-full w-full items-stretch gap-2 bg-accent p-4">
			<SimulationSetup />
			<SimulationParams />
			<SimulationResults />
		</section>
	);
};

export default Home;

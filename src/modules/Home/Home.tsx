import SimulationParams from "@/modules/Home/SimulationParams";
import SimulationResults from "@/modules/Home/SimulationResults";
import SimulationSetup from "@/modules/Home/SimulationSetup";
import { useHome } from "@/modules/Home/useHome";

const Home = () => {
	const homeState = useHome();

	return (
		<section className="flex h-full min-h-full w-full items-stretch gap-2 bg-accent p-4">
			<SimulationSetup {...homeState} />
			<SimulationParams {...homeState} />
			<SimulationResults {...homeState} />
		</section>
	);
};

export default Home;

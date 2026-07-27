import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import SimulationParams from "@/modules/Home/SimulationParams";
import SimulationResults from "@/modules/Home/SimulationResults";
import SimulationSetup from "@/modules/Home/SimulationSetup";
import { useHome } from "@/modules/Home/useHome";

const Home = () => {
	const homeState = useHome();
	const [isSetupCollapsed, setIsSetupCollapsed] = useState(false);

	const toggleSetupPanel = () => {
		setIsSetupCollapsed((current) => !current);
	};

	return (
		<section className="h-full min-h-full w-full bg-accent p-4">
			<div className="flex h-full min-h-0 w-full gap-2">
				<aside
					className={`${
						isSetupCollapsed ? "w-12" : "w-1/4"
					} min-w-0 shrink-0 overflow-hidden transition-[width] duration-200 ease-out`}
				>
					{isSetupCollapsed ? (
						<div className="flex h-full w-full items-start justify-center rounded border border-gray-200 bg-white py-4">
							<Button
								aria-label="Expand simulation setup"
								aria-expanded={false}
								className="h-9 w-9"
								onClick={toggleSetupPanel}
								size="icon"
								variant="ghost"
							>
								<PanelLeftOpen />
							</Button>
						</div>
					) : (
						<div className="relative h-full min-h-0 w-full">
							<SimulationSetup {...homeState} />
							<Button
								aria-label="Collapse simulation setup"
								aria-expanded={true}
								className="absolute right-3 top-3 h-9 w-9"
								onClick={toggleSetupPanel}
								size="icon"
								variant="ghost"
							>
								<PanelLeftClose />
							</Button>
						</div>
					)}
				</aside>
				<div className="h-full min-h-0 min-w-0 flex-[2] overflow-hidden">
					<SimulationParams {...homeState} />
				</div>
				<div className="min-w-0 flex-1">
					<SimulationResults {...homeState} />
				</div>
			</div>
		</section>
	);
};

export default Home;

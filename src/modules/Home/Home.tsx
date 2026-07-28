import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
		<section className="min-h-full w-full overflow-x-hidden bg-accent p-2 sm:p-3 xl:h-full xl:overflow-hidden xl:p-4">
			<div
				className={cn(
					"grid min-h-0 w-full grid-cols-1 gap-3 lg:grid-cols-2 xl:h-full",
					isSetupCollapsed
						? "xl:grid-cols-[3rem_minmax(26rem,2fr)_minmax(18rem,1fr)]"
						: "xl:grid-cols-[minmax(15rem,0.8fr)_minmax(26rem,2fr)_minmax(18rem,1fr)]",
				)}
			>
				<aside className="min-h-0 min-w-0 lg:col-span-2 xl:col-span-1 xl:h-full">
					{isSetupCollapsed ? (
						<>
							<div className="hidden h-full w-full items-start justify-center rounded border border-gray-200 bg-white py-4 xl:flex">
								<Button
									aria-label="Expand simulation setup"
									aria-expanded={false}
									className="h-9 w-9"
									onClick={toggleSetupPanel}
									size="icon"
									variant="ghost"
								>
									<PanelLeftOpen aria-hidden="true" />
								</Button>
							</div>
							<div className="xl:hidden">
								<SimulationSetup {...homeState} />
							</div>
						</>
					) : (
						<div className="relative h-full min-h-0 w-full overflow-hidden">
							<SimulationSetup {...homeState} />
							<Button
								aria-label="Collapse simulation setup"
								aria-expanded={true}
								className="absolute right-3 top-3 hidden h-9 w-9 xl:inline-flex"
								onClick={toggleSetupPanel}
								size="icon"
								variant="ghost"
							>
								<PanelLeftClose aria-hidden="true" />
							</Button>
						</div>
					)}
				</aside>
				<div className="min-h-0 min-w-0 xl:h-full xl:overflow-hidden">
					<SimulationParams {...homeState} />
				</div>
				<div className="min-h-0 min-w-0 xl:h-full xl:overflow-hidden">
					<SimulationResults {...homeState} />
				</div>
			</div>
		</section>
	);
};

export default Home;

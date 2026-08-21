import { Settings } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import SectionTitle from "@/modules/Home/SectionTitle";
import {
	getSimulationSubtypeHelp,
	infoList,
	simulationTypeList,
} from "@/modules/Home/SimUtils";
import type { HomeState } from "@/modules/Home/useHome";

const SimulationSetup = (homeState: HomeState) => {
	const {
		simType,
		simSubType,
		setupComplete,
		simulationSubtypeList,
		handleSimulationTypeChange,
		handleSimulationSubtypeChange,
	} = homeState;

	return (
		<div className="workspace-panel space-y-4">
			<SectionTitle title="Simulation Setup" icon={<Settings />} />

			<form className="w-full">
				<FieldGroup className="w-full gap-4">
					<Field>
						<FieldLabel htmlFor={"simType"} className="font-semibold text-sm">
							1. Simulation Type
						</FieldLabel>
						<Select
							id="simType"
							name="simulationType"
							items={simulationTypeList}
							value={simType || null}
							onValueChange={handleSimulationTypeChange}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select a simulation type..." />
							</SelectTrigger>
							<SelectContent alignItemWithTrigger>
								<SelectGroup>
									{simulationTypeList.map((item) => (
										<SelectItem key={item.label} value={item.value}>
											{item.label}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
						<p className="text-muted-foreground text-xs leading-relaxed">
							Choose the broad category of simulation
						</p>
					</Field>

					<Field>
						<FieldLabel
							htmlFor={"simSubtype"}
							className="font-semibold text-sm"
						>
							2. Simulation Subtype / Code
						</FieldLabel>
						<Select
							id="simSubtype"
							name="simulationSubtype"
							items={simulationSubtypeList}
							value={simSubType || null}
							onValueChange={handleSimulationSubtypeChange}
							disabled={!simType}
						>
							<SelectTrigger className="w-full">
								<SelectValue
									placeholder={
										simType
											? "Select a simulation subtype..."
											: "First Select a simulation type..."
									}
								/>
							</SelectTrigger>
							<SelectContent alignItemWithTrigger>
								<SelectGroup>
									{simulationSubtypeList.map((item) => (
										<SelectItem key={item.label} value={item.value}>
											{item.label}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
						<p className="text-muted-foreground text-xs leading-relaxed">
							Choose the specific code or method
						</p>
					</Field>
				</FieldGroup>
			</form>

			<div className="space-y-2 rounded-md border border-primary/15 bg-primary/5 p-4">
				<p className="font-semibold text-primary text-sm">
					{setupComplete ? "About This Setup" : "Examples"}
				</p>
				{setupComplete ? (
					<p className="text-sm leading-relaxed">
						{getSimulationSubtypeHelp(simSubType)}
					</p>
				) : (
					<ul className="space-y-2">
						{infoList.map((item) => (
							<li className="text-sm leading-relaxed" key={item.type}>
								{item.type}&nbsp;
								<span className="font-semibold text-primary text-sm">to</span>
								&nbsp;
								{item.subtype}
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
};

export default SimulationSetup;

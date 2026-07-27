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
	getSimulatorConfig,
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
	const simulatorConfig = getSimulatorConfig(simSubType);

	return (
		<div className="flex-1/4 rounded border border-gray-200 bg-white p-6 space-y-4">
			<SectionTitle title="Simulation Setup" icon={<Settings />} />

			<form className="w-full">
				<FieldGroup className="gap-4 w-full">
					<Field>
						<FieldLabel htmlFor={"simType"} className="font-semibold text-lg">
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
						<p>Choose the broad category of simulation</p>
					</Field>

					<Field>
						<FieldLabel
							htmlFor={"simSubtype"}
							className="font-semibold text-lg"
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
						<p>Choose the specific code or method</p>
					</Field>
				</FieldGroup>
			</form>

			<div className="p-4 bg-primary-foreground rounded space-y-2">
				<p className="text-primary font-semibold text-base">
					{setupComplete ? "About This Setup" : "Examples"}
				</p>
				{setupComplete ? (
					<p>{simulatorConfig?.description ?? "Configure the selected simulator."}</p>
				) : (
					<ul className=" space-y-2">
						{infoList.map((item) => (
							<li key={item.type}>
								{item.type}&nbsp;<span className="text-primary">to</span>&nbsp;
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

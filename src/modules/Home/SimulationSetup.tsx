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
import { infoList, simulationTypeList, useHome } from "@/modules/Home/useHome";

const SimulationSetup = () => {
	const {
		simType,
		simSubType,
		setupComplete,
		simulationSubtypeList,
		handleSimulationTypeChange,
		handleSimulationSubtypeChange,
		handleSubmit,
	} = useHome();

	return (
		<div className="flex-1/4 rounded border border-gray-200 bg-white p-2">
			<SectionTitle title="Simulation Setup" />

			<form onSubmit={handleSubmit}>
				<FieldGroup className="gap-4">
					<Field>
						<FieldLabel htmlFor={"simType"}>Simulation Type</FieldLabel>
						<Select
							id="simType"
							name="simulationType"
							items={simulationTypeList}
							value={simType || null}
							onValueChange={handleSimulationTypeChange}
						>
							<SelectTrigger className="w-full max-w-48">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
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
						<FieldLabel htmlFor={"simSubtype"}>
							Simulation Subtype / Code
						</FieldLabel>
						<Select
							id="simSubtype"
							name="simulationSubtype"
							items={simulationSubtypeList}
							value={simSubType || null}
							onValueChange={handleSimulationSubtypeChange}
							disabled={!simType}
						>
							<SelectTrigger className="w-full max-w-48">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
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
					<p>
						{simSubType === "Quantum ESPRESSO"
							? "Quantum ESPRESSO uses a CSV parameter file and one UPF file for each chemical element."
							: "This prototype shows the same example parameter form for any selected simulator."}
					</p>
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

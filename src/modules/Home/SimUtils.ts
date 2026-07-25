import ABINIT from "@/modules/Home/SubTypes/ABINIT";
import QuantumExpresso from "@/modules/Home/SubTypes/QuantumExpresso";
import type { HomeState } from "@/modules/Home/useHome";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const QE_TEMPLATE_BASE = "/templates/DFT_quantum_espresso";

export const QE_UPLOADS = [
	{
		id: "parameters",
		label: "Input Parameters",
		description: "Upload the Quantum ESPRESSO input parameters as a CSV file.",
		accept: ".csv",
		extension: ".csv",
		multiple: false,
		required: true,
		template: `${QE_TEMPLATE_BASE}/input-parameters-template.csv`,
		templateName: "input-parameters-template.csv",
	},
	{
		id: "structure",
		label: "Structure File",
		description:
			"Upload the mandatory material structure file in CIF format. Elements are detected from this file.",
		accept: ".cif",
		extension: ".cif",
		multiple: false,
		required: true,
	},
];

export type SimulationState = {
	id: string;
	label: string;
	help: string;
	subtypes: string[];
};

export const SIMULATION_LIST: SimulationState[] = [
	{
		id: "DFT",
		label: "DFT (Density Functional Theory)",
		help: "Quantum-level material simulation for crystalline and atomistic systems.",
		subtypes: ["Quantum ESPRESSO", "ABINIT", "CP2K"],
	},
	{
		id: "FEM",
		label: "FEM (Finite Element Method)",
		help: "Continuum simulation for structures, heat transfer, meshes, and PDE models.",
		subtypes: ["BFE.NET - Cantilever Beam", "MYSTRAN", "JAX-FEM"],
	},
	{
		id: "High-Throughput",
		label: "High-Throughput Workflow",
		help: "Workflow orchestration, provenance, and automated simulator execution.",
		subtypes: ["AiiDA Workflow", "ASE"],
	},
	{
		id: "Others",
		label: "Others",
		help: "Specialized simulators outside the main DFT/FEM workflow categories.",
		subtypes: ["MEEP FDTD", "Monte Carlo"],
	},
];

export const infoList = SIMULATION_LIST.map((item) => ({
	type: item.id,
	subtype: item.subtypes[0],
}));

export const simulationTypeList = SIMULATION_LIST.map((sim) => ({
	label: sim.label,
	value: sim.id,
}));

export const getSimulationSubtypeList = (simulationType: string) =>
	SIMULATION_LIST.find((sim) => sim.id === simulationType)?.subtypes.map(
		(subtype) => ({ label: subtype, value: subtype }),
	) ?? [];

type SubTypeConfig = Record<string, React.ComponentType<HomeState>>;

export const simulationParameterComponents: SubTypeConfig = {
	"Quantum ESPRESSO": QuantumExpresso,
	ABINIT: ABINIT,
	CP2K: QuantumExpresso,
	"BFE.NET - Cantilever Beam": QuantumExpresso,
	MYSTRAN: QuantumExpresso,
	"JAX-FEM": QuantumExpresso,
	"AiiDA Workflow": QuantumExpresso,
	ASE: QuantumExpresso,
	"MEEP FDTD": QuantumExpresso,
	"Monte Carlo": QuantumExpresso,
};

import QuantumExpresso from "@/modules/Home/SubTypes/QuantumExpresso";

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

type SubTypeConfig = Record<string, React.ComponentType>;

export const simulationParameterComponents: SubTypeConfig = {
	"Quantum ESPRESSO": QuantumExpresso,
	ABINIT: QuantumExpresso,
	CP2K: QuantumExpresso,
	"BFE.NET - Cantilever Beam": QuantumExpresso,
	MYSTRAN: QuantumExpresso,
	"JAX-FEM": QuantumExpresso,
	"AiiDA Workflow": QuantumExpresso,
	ASE: QuantumExpresso,
	"MEEP FDTD": QuantumExpresso,
	"Monte Carlo": QuantumExpresso,
};

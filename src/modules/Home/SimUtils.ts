import ABINIT from "@/modules/Home/SubTypes/ABINIT";
import AiiDA_Workflow from "@/modules/Home/SubTypes/AiiDA_Workflow";
import ASE from "@/modules/Home/SubTypes/ASE";
import BFE_NET from "@/modules/Home/SubTypes/BFE_NET";
import BigDFT from "@/modules/Home/SubTypes/BigDFT";
import CP2K from "@/modules/Home/SubTypes/CP2K";
import JAX_FEM from "@/modules/Home/SubTypes/JAX_FEM";
import MEEP_FDTD from "@/modules/Home/SubTypes/MEEP_FDTD";
import MonteCarlo from "@/modules/Home/SubTypes/MonteCarlo";
import MYSTRAN from "@/modules/Home/SubTypes/MYSTRAN";
import QuantumExpresso from "@/modules/Home/SubTypes/QuantumExpresso";
import type { HomeState } from "@/modules/Home/useHome";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const QE_TEMPLATE_BASE = "/templates/DFT_quantum_espresso";
export const ABINIT_TEMPLATE_BASE = "/templates/DFT_abinit";
export const CP2K_TEMPLATE_BASE = "/templates/DFT_cp2k";

type SimulationResultField = {
	key: string;
	label: string;
};

const SIMULATION_RESULT_FIELDS: Record<string, SimulationResultField[]> = {
	"Quantum ESPRESSO": [
		{ key: "energy", label: "Energy" },
		{ key: "fermi_energy", label: "Fermi Energy" },
		{ key: "volume", label: "Volume" },
		{ key: "scf_iterations", label: "SCF Iterations" },
	],
	ABINIT: [
		{ key: "energy", label: "Energy" },
		{ key: "e_fermie", label: "Fermi Energy" },
		{ key: "pressure", label: "Pressure" },
		{ key: "e_kinetic", label: "Kinetic Energy" },
		{ key: "e_xc", label: "Exchange-Correlation Energy" },
	],
};

export const getSimulationResultFields = (simulatorLabel: string) =>
	SIMULATION_RESULT_FIELDS[simulatorLabel] ?? [];

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
		subtypes: ["Quantum ESPRESSO", "ABINIT", "CP2K", "BigDFT"],
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

const SIMULATION_SUBTYPE_HELP: Record<string, string> = {
	"Quantum ESPRESSO":
		"Configure a Quantum ESPRESSO calculation and its required input files.",
	ABINIT:
		"Configure the ABINIT workflow, plane-wave basis, Brillouin-zone sampling, and convergence controls.",
	CP2K: "Configure the CP2K workflow, Quickstep method, density grid, and SCF convergence controls.",
	BigDFT:
		"Configure a BigDFT calculation with its parameter, structure, and optional per-element pseudopotential files.",
	"BFE.NET - Cantilever Beam":
		"Upload a cantilever model definition containing geometry, material, loads, and boundary conditions.",
	MYSTRAN:
		"Upload a NASTRAN-style bulk data model and any referenced include files.",
	"JAX-FEM":
		"Upload a differentiable FEM model configuration and its mesh or field data.",
	"AiiDA Workflow":
		"Upload a workflow definition plus the structures and calculator inputs required by AiiDA.",
	ASE: "Upload an ASE script or atomic structure plus calculator-specific input files.",
	"MEEP FDTD":
		"Upload a MEEP simulation definition and optional geometry or material datasets.",
	"Monte Carlo":
		"Upload a backend-specific Monte Carlo run configuration and optional datasets.",
};

export const getSimulationSubtypeHelp = (simulationSubtype: string) =>
	SIMULATION_SUBTYPE_HELP[simulationSubtype] ??
	"Configure the selected simulator using its dedicated parameter form.";

type SubTypeConfig = Record<string, React.ComponentType<HomeState>>;

export const simulationParameterComponents: SubTypeConfig = {
	"Quantum ESPRESSO": QuantumExpresso,
	ABINIT: ABINIT,
	CP2K: CP2K,
	BigDFT: BigDFT,
	"BFE.NET - Cantilever Beam": BFE_NET,
	MYSTRAN: MYSTRAN,
	"JAX-FEM": JAX_FEM,
	"AiiDA Workflow": AiiDA_Workflow,
	ASE: ASE,
	"MEEP FDTD": MEEP_FDTD,
	"Monte Carlo": MonteCarlo,
};

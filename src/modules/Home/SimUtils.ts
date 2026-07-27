import ABINIT from "@/modules/Home/SubTypes/ABINIT";
import CP2K from "@/modules/Home/SubTypes/CP2K";
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

export type SimulatorParameterValue = string | number | boolean;

export type SimulatorParameterField = {
	id: string;
	section: string;
	label: string;
	description: string;
	type: "text" | "number" | "select";
	defaultValue?: SimulatorParameterValue;
	required: boolean;
	unit?: string;
	min?: number;
	max?: number;
	step?: number;
	options?: { label: string; value: string }[];
};

export type SimulatorConfig = {
	label: string;
	calculatorSlug: string;
	projectPrefix: string;
	description: string;
	fields: SimulatorParameterField[];
};

export const SIMULATOR_CONFIGS = {
	"Quantum ESPRESSO": {
		label: "Quantum ESPRESSO",
		calculatorSlug: "Quantum-Espresso",
		projectPrefix: "DFT_quantum_espresso",
		description:
			"Configure a Quantum ESPRESSO calculation and upload any required pseudopotentials.",
		fields: [
			{
				id: "calculation",
				section: "Calculation",
				label: "Calculation Type",
				description: "Choose the electronic or structural calculation to run.",
				type: "select",
				defaultValue: "scf",
				required: true,
				options: [{ label: "SCF", value: "scf" }],
			},
		],
	},
	ABINIT: {
		label: "ABINIT",
		calculatorSlug: "ABINIT",
		projectPrefix: "DFT_abinit",
		description:
			"Configure an ABINIT calculation using a native input file and the pseudopotentials referenced by that input.",
		fields: [
			{
				id: "optdriver",
				section: "Calculation",
				label: "Calculation Type",
				description:
					"Select a ground-state, structural relaxation, or band-structure workflow.",
				type: "select",
				defaultValue: "scf",
				required: true,
				options: [
					{ label: "Ground-state SCF", value: "scf" },
					{ label: "Geometry optimization", value: "relax" },
					{ label: "Band structure", value: "bands" },
				],
			},
			{
				id: "ecut",
				section: "Basis and Brillouin Zone",
				label: "Plane-wave Cutoff",
				description:
					"Kinetic-energy cutoff for the plane-wave basis. Confirm convergence for the chosen pseudopotentials.",
				type: "number",
				defaultValue: 20,
				unit: "Ha",
				min: 1,
				step: 1,
				required: true,
			},
			{
				id: "ngkpt",
				section: "Basis and Brillouin Zone",
				label: "K-point Grid",
				description: "Three positive integers, for example 4 4 4.",
				type: "text",
				defaultValue: "4 4 4",
				required: true,
			},
			{
				id: "tolvrs",
				section: "SCF Convergence",
				label: "Residual Potential Tolerance",
				description: "Stop when the squared residual potential reaches this threshold.",
				type: "number",
				defaultValue: 1e-10,
				min: 0,
				step: 1e-12,
				required: true,
			},
			{
				id: "nstep",
				section: "SCF Convergence",
				label: "Maximum SCF Steps",
				description: "Maximum number of electronic iterations before the run stops.",
				type: "number",
				defaultValue: 100,
				min: 1,
				max: 1000,
				step: 1,
				required: true,
			},
		],
	},
	CP2K: {
		label: "CP2K",
		calculatorSlug: "CP2K",
		projectPrefix: "DFT_cp2k",
		description:
			"Configure a CP2K calculation using a native input file and any custom basis, potential, coordinate, or restart files it references.",
		fields: [
			{
				id: "run_type",
				section: "Calculation",
				label: "Run Type",
				description: "Choose the top-level CP2K calculation workflow.",
				type: "select",
				defaultValue: "ENERGY_FORCE",
				required: true,
				options: [
					{ label: "Energy and forces", value: "ENERGY_FORCE" },
					{ label: "Geometry optimization", value: "GEO_OPT" },
					{ label: "Cell optimization", value: "CELL_OPT" },
					{ label: "Molecular dynamics", value: "MD" },
				],
			},
			{
				id: "method",
				section: "Electronic Structure",
				label: "Quickstep Method",
				description: "GPW is the standard choice; GAPW is used for all-electron-like accuracy.",
				type: "select",
				defaultValue: "GPW",
				required: true,
				options: [
					{ label: "GPW", value: "GPW" },
					{ label: "GAPW", value: "GAPW" },
				],
			},
			{
				id: "xc_functional",
				section: "Electronic Structure",
				label: "Exchange-correlation Functional",
				description: "Functional used by the DFT calculation.",
				type: "select",
				defaultValue: "PBE",
				required: true,
				options: [
					{ label: "PBE", value: "PBE" },
					{ label: "PBEsol", value: "PBESOL" },
					{ label: "BLYP", value: "BLYP" },
				],
			},
			{
				id: "cutoff",
				section: "Grid and Basis",
				label: "Plane-wave Cutoff",
				description: "Density-grid cutoff; confirm convergence for the selected basis and potential.",
				type: "number",
				defaultValue: 400,
				unit: "Ry",
				min: 1,
				step: 10,
				required: true,
			},
			{
				id: "rel_cutoff",
				section: "Grid and Basis",
				label: "Relative Cutoff",
				description: "Controls mapping of Gaussian functions onto the multigrid.",
				type: "number",
				defaultValue: 60,
				unit: "Ry",
				min: 1,
				step: 5,
				required: true,
			},
			{
				id: "eps_scf",
				section: "SCF Convergence",
				label: "SCF Accuracy",
				description: "Target convergence threshold for the SCF cycle.",
				type: "number",
				defaultValue: 1e-6,
				min: 0,
				step: 1e-7,
				required: true,
			},
			{
				id: "max_scf",
				section: "SCF Convergence",
				label: "Maximum SCF Steps",
				description:
					"Maximum number of electronic iterations before the run stops.",
				type: "number",
				defaultValue: 50,
				min: 1,
				max: 1000,
				step: 1,
				required: true,
			},
		],
	},
} satisfies Record<string, SimulatorConfig>;

export const getSimulatorConfig = (simulator: string) =>
	SIMULATOR_CONFIGS[simulator as keyof typeof SIMULATOR_CONFIGS];

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
	CP2K: CP2K,
	"BFE.NET - Cantilever Beam": QuantumExpresso,
	MYSTRAN: QuantumExpresso,
	"JAX-FEM": QuantumExpresso,
	"AiiDA Workflow": QuantumExpresso,
	ASE: QuantumExpresso,
	"MEEP FDTD": QuantumExpresso,
	"Monte Carlo": QuantumExpresso,
};

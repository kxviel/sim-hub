import ABINIT from "@/modules/Home/SubTypes/ABINIT";
import BigDFT from "@/modules/Home/SubTypes/BigDFT";
import CP2K from "@/modules/Home/SubTypes/CP2K";
import Exciting from "@/modules/Home/SubTypes/Exciting";
import Fleur from "@/modules/Home/SubTypes/Fleur";
import GPAW from "@/modules/Home/SubTypes/GPAW";
import MonteCarlo from "@/modules/Home/SubTypes/MonteCarlo";
import Octopus from "@/modules/Home/SubTypes/Octopus";
import QuantumExpresso from "@/modules/Home/SubTypes/QuantumExpresso";
import Siesta from "@/modules/Home/SubTypes/Siesta";
import SimpleUploadSubtype from "@/modules/Home/SubTypes/SimpleUploadSubtype";
import type { HomeState } from "@/modules/Home/useHome";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const QE_TEMPLATE_BASE = "/templates/DFT_quantum_espresso";
export const ABINIT_TEMPLATE_BASE = "/templates/DFT_abinit";
export const CP2K_TEMPLATE_BASE = "/templates/DFT_cp2k";

const SIMULATION_CSV_EXAMPLES: Record<
	string,
	{ downloadName: string; href: string }
> = {
	CP2K: {
		downloadName: "cp2k-input-example.csv",
		href: "/examples/DFT_cp2k/cp2k-input-example.csv",
	},
	GPAW: {
		downloadName: "gpaw-input-example.csv",
		href: "/examples/DFT_gpaw/gpaw-input-example.csv",
	},
	Octopus: {
		downloadName: "octopus-input-example.csv",
		href: "/examples/DFT_octopus/octopus-input-example.csv",
	},
	Siesta: {
		downloadName: "siesta-input-example.csv",
		href: "/examples/DFT_siesta/siesta-input-example.csv",
	},
};

export const getSimulationCsvExample = (simulator: string) =>
	SIMULATION_CSV_EXAMPLES[simulator];

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
		subtypes: [
			"Quantum ESPRESSO",
			"ABINIT",
			"CP2K",
			"BigDFT",
			"Siesta",
			"Octopus",
			"GPAW",
			"Exciting",
			"Fleur",
		],
	},
	{
		id: "FEM",
		label: "FEM (Finite Element Method)",
		help: "Continuum simulation for structures, heat transfer, meshes, and PDE models.",
		subtypes: [
			"sectionproperties",
			"FEAScript",
			"new_abaqus",
			"JAX-FEM",
			"BFE.NET",
			"FEMWELL",
			"MYSTRAN",
			"STAN",
			"MFEM",
			"FEBio",
		],
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
		"Upload CSV and CIF inputs in Basic mode, or add per-element UPF files in Advanced mode.",
	ABINIT:
		"Upload CSV and CIF inputs in Basic mode, or add same-format per-element pseudopotentials in Advanced mode.",
	CP2K: "Configure the CP2K workflow, Quickstep method, density grid, and SCF convergence controls.",
	BigDFT:
		"Configure BigDFT with internal pseudopotentials or Advanced per-element uploads.",
	Siesta:
		"Configure Siesta with CSV/CIF inputs, optional per-element pseudopotentials, and Advanced XC settings.",
	Octopus:
		"Configure Octopus with CSV/CIF inputs and optional Advanced per-element pseudopotentials.",
	GPAW: "Configure GPAW with CSV/CIF inputs and optional Advanced per-element pseudopotentials.",
	Exciting:
		"Configure Exciting with CSV/CIF inputs, optional RMT values, and Advanced per-element pseudopotentials.",
	Fleur: "Upload one CSV parameter file and one CIF structure file.",
	sectionproperties:
		"Upload the sectionproperties rectangle input as a CSV file.",
	FEAScript: "Upload the FEAScript heat conduction input as a CSV file.",
	new_abaqus: "Upload the new_abaqus model input as an INP file.",
	"JAX-FEM": "Upload the JAX-FEM 3D linear Poisson input as a CSV file.",
	"BFE.NET": "Upload the BFE.NET simple cantilever input as a CSV file.",
	FEMWELL: "Upload the FEMWELL thermal phase shifter input as a CSV file.",
	MYSTRAN: "Upload the MYSTRAN model as a BDF, DAT, or NAS file.",
	STAN: "Upload the STAN model input as an STDb file.",
	MFEM: "Upload the MFEM CSV input and mesh file.",
	FEBio: "Upload the FEBio model input as a .feb file.",
	"MEEP FDTD": "Upload the MEEP FDTD input parameters as a CSV file.",
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
	Siesta: Siesta,
	Octopus: Octopus,
	GPAW: GPAW,
	Exciting: Exciting,
	Fleur: Fleur,
	sectionproperties: SimpleUploadSubtype,
	FEAScript: SimpleUploadSubtype,
	new_abaqus: SimpleUploadSubtype,
	"JAX-FEM": SimpleUploadSubtype,
	"BFE.NET": SimpleUploadSubtype,
	FEMWELL: SimpleUploadSubtype,
	MYSTRAN: SimpleUploadSubtype,
	STAN: SimpleUploadSubtype,
	MFEM: SimpleUploadSubtype,
	FEBio: SimpleUploadSubtype,
	"MEEP FDTD": SimpleUploadSubtype,
	"Monte Carlo": MonteCarlo,
};

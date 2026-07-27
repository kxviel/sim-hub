import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { MAX_FILE_SIZE, simulationTypeList } from "@/modules/Home/SimUtils";
import type { HomeState } from "@/modules/Home/useHome";

const CALCULATION_TYPES = [
	{ label: "Ground-state SCF", value: "scf" },
	{ label: "Geometry optimization", value: "relax" },
	{ label: "Band structure", value: "bands" },
];

// API template: update the slug and multipart field names to match the backend.
const API_TEMPLATE = {
	calculatorSlug: "ABINIT",
	projectPrefix: "DFT_abinit",
	simulatorLabel: "ABINIT",
	primaryFileField: "input_file",
	optionalFileField: "pseudopotential_files",
} as const;

const ABINIT = ({
	simType,
	isSubmitting,
	handleConfiguredSubmit,
}: HomeState) => {
	const [calculationType, setCalculationType] = useState("scf");
	const [ecut, setEcut] = useState("20");
	const [kPointGrid, setKPointGrid] = useState("4 4 4");
	const [tolvrs, setTolvrs] = useState("1e-10");
	const [nstep, setNstep] = useState("100");
	const [inputFiles, setInputFiles] = useState<File[]>([]);
	const [pseudopotentialFiles, setPseudopotentialFiles] = useState<File[]>([]);

	const handleInputFileChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const selectedFiles = Array.from(event.target.files ?? []);

		if (selectedFiles.some((file) => file.size > MAX_FILE_SIZE)) {
			toast.error("ABINIT input files must be 5 MB or smaller.");
			event.target.value = "";
			return;
		}

		setInputFiles(selectedFiles);
	};

	const handlePseudopotentialFileChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const selectedFiles = Array.from(event.target.files ?? []);

		if (selectedFiles.some((file) => file.size > MAX_FILE_SIZE)) {
			toast.error("ABINIT pseudopotential files must be 5 MB or smaller.");
			event.target.value = "";
			return;
		}

		setPseudopotentialFiles(selectedFiles);
	};

	const handleRunSimulation = () => {
		const parsedEcut = Number(ecut);
		const parsedTolvrs = Number(tolvrs);
		const parsedNstep = Number(nstep);
		const kPoints = kPointGrid.trim().split(/\s+/).map(Number);

		if (!Number.isFinite(parsedEcut) || parsedEcut <= 0) {
			toast.error("Plane-wave cutoff must be greater than zero.");
			return;
		}

		if (
			kPoints.length !== 3 ||
			kPoints.some((value) => !Number.isInteger(value) || value <= 0)
		) {
			toast.error("K-point grid must contain three positive integers.");
			return;
		}

		if (!Number.isFinite(parsedTolvrs) || parsedTolvrs <= 0) {
			toast.error("Residual potential tolerance must be greater than zero.");
			return;
		}

		if (
			!Number.isInteger(parsedNstep) ||
			parsedNstep < 1 ||
			parsedNstep > 1000
		) {
			toast.error("Maximum SCF steps must be an integer from 1 to 1000.");
			return;
		}

		if (inputFiles.length === 0) {
			toast.error("Upload an ABINIT input or structure file.");
			return;
		}

		handleConfiguredSubmit({
			...API_TEMPLATE,
			parameters: {
				optdriver: calculationType,
				ecut: parsedEcut,
				ngkpt: kPoints,
				tolvrs: parsedTolvrs,
				nstep: parsedNstep,
			},
			fileGroups: [
				{ fieldName: API_TEMPLATE.primaryFileField, files: inputFiles },
				{
					fieldName: API_TEMPLATE.optionalFileField,
					files: pseudopotentialFiles,
				},
			],
		});
	};

	return (
		<div className="w-full space-y-5">
			<div className="space-y-1">
				<p>
					Configure the ABINIT workflow, plane-wave basis, Brillouin-zone
					sampling, and convergence controls.
				</p>
				<p className="text-sm text-muted-foreground">
					{simulationTypeList.find((item) => item.value === simType)?.label}
				</p>
			</div>

			<fieldset className="space-y-4 rounded border border-gray-200 p-4">
				<legend className="px-1 text-base font-semibold">Calculation</legend>
				<div className="space-y-2">
					<Label htmlFor="abinit-calculation-type">Calculation Type</Label>
					<Select
						id="abinit-calculation-type"
						name="abinit-calculation-type"
						items={CALCULATION_TYPES}
						value={calculationType}
						disabled={isSubmitting}
						onValueChange={(value) => setCalculationType(value ?? "scf")}
					>
						<SelectTrigger className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent alignItemWithTrigger>
							<SelectGroup>
								{CALCULATION_TYPES.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
					<p className="text-sm text-muted-foreground">
						Choose a ground-state, relaxation, or band-structure workflow.
					</p>
				</div>
			</fieldset>

			<fieldset className="space-y-4 rounded border border-gray-200 p-4">
				<legend className="px-1 text-base font-semibold">
					Basis and Brillouin Zone
				</legend>
				<div className="space-y-2">
					<Label htmlFor="abinit-ecut">Plane-wave Cutoff (Ha)</Label>
					<Input
						id="abinit-ecut"
						type="number"
						min={1}
						step={1}
						value={ecut}
						disabled={isSubmitting}
						onChange={(event) => setEcut(event.target.value)}
					/>
					<p className="text-sm text-muted-foreground">
						Confirm cutoff convergence for the selected pseudopotentials.
					</p>
				</div>
				<div className="space-y-2">
					<Label htmlFor="abinit-ngkpt">K-point Grid</Label>
					<Input
						id="abinit-ngkpt"
						value={kPointGrid}
						disabled={isSubmitting}
						onChange={(event) => setKPointGrid(event.target.value)}
					/>
					<p className="text-sm text-muted-foreground">
						Enter three positive integers, for example 4 4 4.
					</p>
				</div>
			</fieldset>

			<fieldset className="space-y-4 rounded border border-gray-200 p-4">
				<legend className="px-1 text-base font-semibold">
					SCF Convergence
				</legend>
				<div className="space-y-2">
					<Label htmlFor="abinit-tolvrs">Residual Potential Tolerance</Label>
					<Input
						id="abinit-tolvrs"
						type="number"
						min={0}
						step={1e-12}
						value={tolvrs}
						disabled={isSubmitting}
						onChange={(event) => setTolvrs(event.target.value)}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="abinit-nstep">Maximum SCF Steps</Label>
					<Input
						id="abinit-nstep"
						type="number"
						min={1}
						max={1000}
						step={1}
						value={nstep}
						disabled={isSubmitting}
						onChange={(event) => setNstep(event.target.value)}
					/>
				</div>
			</fieldset>

			<fieldset className="space-y-4 rounded border border-gray-200 p-4">
				<legend className="px-1 text-base font-semibold">Input Files</legend>
				<div className="space-y-2">
					<Label htmlFor="abinit-input-file">ABINIT Input or Structure</Label>
					<Input
						id="abinit-input-file"
						type="file"
						accept=".in,.abi,.files,.cif,.xyz"
						disabled={isSubmitting}
						onChange={handleInputFileChange}
					/>
					<p className="text-sm text-muted-foreground">
						Template field: {API_TEMPLATE.primaryFileField}. Change it when the
						backend contract is known.
					</p>
				</div>
				<div className="space-y-2">
					<Label htmlFor="abinit-pseudopotentials">
						Pseudopotential Files (optional)
					</Label>
					<Input
						id="abinit-pseudopotentials"
						type="file"
						accept=".psp,.psp8,.pspnc"
						multiple
						disabled={isSubmitting}
						onChange={handlePseudopotentialFileChange}
					/>
				</div>
			</fieldset>

			<Button
				className="my-4 w-full py-4 text-lg"
				disabled={isSubmitting}
				onClick={handleRunSimulation}
			>
				{isSubmitting ? "Submitting ABINIT..." : "Run Simulation"}
			</Button>
		</div>
	);
};

export default ABINIT;

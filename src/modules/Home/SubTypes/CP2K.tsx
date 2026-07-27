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

const RUN_TYPES = [
	{ label: "Energy and forces", value: "ENERGY_FORCE" },
	{ label: "Geometry optimization", value: "GEO_OPT" },
	{ label: "Cell optimization", value: "CELL_OPT" },
	{ label: "Molecular dynamics", value: "MD" },
];

const QUICKSTEP_METHODS = [
	{ label: "GPW", value: "GPW" },
	{ label: "GAPW", value: "GAPW" },
];

const XC_FUNCTIONALS = [
	{ label: "PBE", value: "PBE" },
	{ label: "PBEsol", value: "PBESOL" },
	{ label: "BLYP", value: "BLYP" },
];

// API template: update the slug and multipart field names to match the backend.
const API_TEMPLATE = {
	calculatorSlug: "CP2K",
	projectPrefix: "DFT_cp2k",
	simulatorLabel: "CP2K",
	primaryFileField: "input_file",
	optionalFileField: "data_files",
} as const;

const CP2K = ({ simType, isSubmitting, handleConfiguredSubmit }: HomeState) => {
	const [runType, setRunType] = useState("ENERGY_FORCE");
	const [method, setMethod] = useState("GPW");
	const [xcFunctional, setXcFunctional] = useState("PBE");
	const [cutoff, setCutoff] = useState("400");
	const [relativeCutoff, setRelativeCutoff] = useState("60");
	const [epsScf, setEpsScf] = useState("1e-6");
	const [maxScf, setMaxScf] = useState("50");
	const [inputFiles, setInputFiles] = useState<File[]>([]);
	const [dataFiles, setDataFiles] = useState<File[]>([]);

	const handleInputFileChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const selectedFiles = Array.from(event.target.files ?? []);

		if (selectedFiles.some((file) => file.size > MAX_FILE_SIZE)) {
			toast.error("CP2K input files must be 5 MB or smaller.");
			event.target.value = "";
			return;
		}

		setInputFiles(selectedFiles);
	};

	const handleDataFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = Array.from(event.target.files ?? []);

		if (selectedFiles.some((file) => file.size > MAX_FILE_SIZE)) {
			toast.error("CP2K data files must be 5 MB or smaller.");
			event.target.value = "";
			return;
		}

		setDataFiles(selectedFiles);
	};

	const handleRunSimulation = () => {
		const parsedCutoff = Number(cutoff);
		const parsedRelativeCutoff = Number(relativeCutoff);
		const parsedEpsScf = Number(epsScf);
		const parsedMaxScf = Number(maxScf);

		if (!Number.isFinite(parsedCutoff) || parsedCutoff <= 0) {
			toast.error("Plane-wave cutoff must be greater than zero.");
			return;
		}

		if (!Number.isFinite(parsedRelativeCutoff) || parsedRelativeCutoff <= 0) {
			toast.error("Relative cutoff must be greater than zero.");
			return;
		}

		if (!Number.isFinite(parsedEpsScf) || parsedEpsScf <= 0) {
			toast.error("SCF accuracy must be greater than zero.");
			return;
		}

		if (
			!Number.isInteger(parsedMaxScf) ||
			parsedMaxScf < 1 ||
			parsedMaxScf > 1000
		) {
			toast.error("Maximum SCF steps must be an integer from 1 to 1000.");
			return;
		}

		if (inputFiles.length === 0) {
			toast.error("Upload a CP2K input or structure file.");
			return;
		}

		handleConfiguredSubmit({
			...API_TEMPLATE,
			parameters: {
				run_type: runType,
				method,
				xc_functional: xcFunctional,
				cutoff: parsedCutoff,
				rel_cutoff: parsedRelativeCutoff,
				eps_scf: parsedEpsScf,
				max_scf: parsedMaxScf,
			},
			fileGroups: [
				{ fieldName: API_TEMPLATE.primaryFileField, files: inputFiles },
				{ fieldName: API_TEMPLATE.optionalFileField, files: dataFiles },
			],
		});
	};

	return (
		<div className="w-full space-y-5">
			<div className="space-y-1">
				<p>
					Configure the CP2K workflow, Quickstep method, density grid, and SCF
					convergence controls.
				</p>
				<p className="text-sm text-muted-foreground">
					{simulationTypeList.find((item) => item.value === simType)?.label}
				</p>
			</div>

			<fieldset className="space-y-4 rounded border border-gray-200 p-4">
				<legend className="px-1 text-base font-semibold">Calculation</legend>
				<div className="space-y-2">
					<Label htmlFor="cp2k-run-type">Run Type</Label>
					<Select
						id="cp2k-run-type"
						name="cp2k-run-type"
						items={RUN_TYPES}
						value={runType}
						disabled={isSubmitting}
						onValueChange={(value) => setRunType(value ?? "ENERGY_FORCE")}
					>
						<SelectTrigger className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent alignItemWithTrigger>
							<SelectGroup>
								{RUN_TYPES.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
			</fieldset>

			<fieldset className="space-y-4 rounded border border-gray-200 p-4">
				<legend className="px-1 text-base font-semibold">
					Electronic Structure
				</legend>
				<div className="space-y-2">
					<Label htmlFor="cp2k-method">Quickstep Method</Label>
					<Select
						id="cp2k-method"
						name="cp2k-method"
						items={QUICKSTEP_METHODS}
						value={method}
						disabled={isSubmitting}
						onValueChange={(value) => setMethod(value ?? "GPW")}
					>
						<SelectTrigger className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent alignItemWithTrigger>
							<SelectGroup>
								{QUICKSTEP_METHODS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
					<p className="text-sm text-muted-foreground">
						GPW is the standard choice; GAPW is used for all-electron-like
						accuracy.
					</p>
				</div>
				<div className="space-y-2">
					<Label htmlFor="cp2k-xc-functional">
						Exchange-correlation Functional
					</Label>
					<Select
						id="cp2k-xc-functional"
						name="cp2k-xc-functional"
						items={XC_FUNCTIONALS}
						value={xcFunctional}
						disabled={isSubmitting}
						onValueChange={(value) => setXcFunctional(value ?? "PBE")}
					>
						<SelectTrigger className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent alignItemWithTrigger>
							<SelectGroup>
								{XC_FUNCTIONALS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
			</fieldset>

			<fieldset className="space-y-4 rounded border border-gray-200 p-4">
				<legend className="px-1 text-base font-semibold">Grid and Basis</legend>
				<div className="space-y-2">
					<Label htmlFor="cp2k-cutoff">Plane-wave Cutoff (Ry)</Label>
					<Input
						id="cp2k-cutoff"
						type="number"
						min={1}
						step={10}
						value={cutoff}
						disabled={isSubmitting}
						onChange={(event) => setCutoff(event.target.value)}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="cp2k-rel-cutoff">Relative Cutoff (Ry)</Label>
					<Input
						id="cp2k-rel-cutoff"
						type="number"
						min={1}
						step={5}
						value={relativeCutoff}
						disabled={isSubmitting}
						onChange={(event) => setRelativeCutoff(event.target.value)}
					/>
				</div>
			</fieldset>

			<fieldset className="space-y-4 rounded border border-gray-200 p-4">
				<legend className="px-1 text-base font-semibold">
					SCF Convergence
				</legend>
				<div className="space-y-2">
					<Label htmlFor="cp2k-eps-scf">SCF Accuracy</Label>
					<Input
						id="cp2k-eps-scf"
						type="number"
						min={0}
						step={1e-7}
						value={epsScf}
						disabled={isSubmitting}
						onChange={(event) => setEpsScf(event.target.value)}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="cp2k-max-scf">Maximum SCF Steps</Label>
					<Input
						id="cp2k-max-scf"
						type="number"
						min={1}
						max={1000}
						step={1}
						value={maxScf}
						disabled={isSubmitting}
						onChange={(event) => setMaxScf(event.target.value)}
					/>
				</div>
			</fieldset>

			<fieldset className="space-y-4 rounded border border-gray-200 p-4">
				<legend className="px-1 text-base font-semibold">Input Files</legend>
				<div className="space-y-2">
					<Label htmlFor="cp2k-input-file">CP2K Input or Structure</Label>
					<Input
						id="cp2k-input-file"
						type="file"
						accept=".inp,.cif,.xyz,.pdb"
						disabled={isSubmitting}
						onChange={handleInputFileChange}
					/>
					<p className="text-sm text-muted-foreground">
						Template field: {API_TEMPLATE.primaryFileField}. This covers the ODP
						input-template and structure-file cases.
					</p>
				</div>
				<div className="space-y-2">
					<Label htmlFor="cp2k-data-files">
						Basis, Potential, or Topology Files (optional)
					</Label>
					<Input
						id="cp2k-data-files"
						type="file"
						multiple
						disabled={isSubmitting}
						onChange={handleDataFileChange}
					/>
				</div>
			</fieldset>

			<Button
				className="my-4 w-full py-4 text-lg"
				disabled={isSubmitting}
				onClick={handleRunSimulation}
			>
				{isSubmitting ? "Simulating" : "Run Simulation"}
			</Button>
		</div>
	);
};

export default CP2K;

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { HomeState } from "@/modules/Home/useHome";

const QuantumExpresso = (homeState: HomeState) => {
	const { handleFileChange } = homeState;

	return (
		<div className="w-full space-y-4 rounded border border-gray-200 p-2">
			<p>
				Upload the required CSV parameter file and CIF structure file. After the
				CIF is uploaded, detected elements appear below for optional per-element
				UPF upload. Each file must be{" "}
				<strong className="text-primary font-semibold">5 MB</strong> or less.
			</p>

			<div className="w-full space-y-4 rounded border border-gray-200 p-2">
				<p className="font-semibold text-lg">Input Parameters</p>
				<p>
					Upload the Quantum ESPRESSO input parameters as a{" "}
					<strong className="text-primary font-semibold">CSV</strong> file.
				</p>

				<div className="flex items-center gap-4">
					<Button className="w-[50%]">Download Template</Button>
					<Input
						className="w-[50%]"
						type="file"
						multiple
						onChange={handleFileChange}
					/>
				</div>
			</div>

			<div className="w-full space-y-4 rounded border border-gray-200 p-2">
				<p className="font-semibold text-lg">Psuedopotential Files</p>
				<p>
					Optional: upload one UPF file for each chemical element used, for
					example Au.UPF and Si.UPF
				</p>

				<div className="flex items-center gap-4">
					<Button className="w-[50%]">Download Template</Button>
					<Input
						className="w-[50%]"
						placeholder="Upload File"
						// defaultValue={parameter.value}
						type={"file"}
					/>
				</div>
			</div>
		</div>
	);
};

export default QuantumExpresso;

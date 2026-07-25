import { XSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_FILE_SIZE, simulationTypeList } from "@/modules/Home/SimUtils";
import type { HomeState } from "@/modules/Home/useHome";

const ABINIT = (homeState: HomeState) => {
	const { simType, handleParamSubmit } = homeState;

	const [files, setFiles] = useState<File[]>([]);
	const [optionalfiles, setOptionalFiles] = useState<File[]>([]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;

		if (!files) return;

		for (const file of Array.from(files)) {
			if (file.size > MAX_FILE_SIZE) {
				toast(`${file.name} must be 5 MB or smaller.`);
				e.target.value = "";
				return;
			}
		}

		const fileArray = Array.from(files);
		setFiles((prev) => [...prev, ...fileArray]);

		fileArray.forEach((file) => {
			console.log(file.name);
			console.log(file.type);
			console.log(file.size);
		});
	};

	const handleOptionalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;

		if (!files) return;

		for (const file of Array.from(files)) {
			if (file.size > MAX_FILE_SIZE) {
				toast(`${file.name} must be 5 MB or smaller.`);
				e.target.value = "";
				return;
			}
		}

		const fileArray = Array.from(files);
		setOptionalFiles((prev) => [...prev, ...fileArray]);

		fileArray.forEach((file) => {
			console.log(file.name);
			console.log(file.type);
			console.log(file.size);
		});
	};

	const handleRemoveFile = (fileIndex: number) => {
		setFiles((prevFiles) =>
			prevFiles.filter((_, index) => index !== fileIndex),
		);
	};

	const handleRemoveOptionalFile = (fileIndex: number) => {
		setOptionalFiles((prevFiles) =>
			prevFiles.filter((_, index) => index !== fileIndex),
		);
	};

	return (
		<div className="w-full space-y-4">
			<p>Set the required parameters or upload input files.</p>
			<p className="font-semibold text-lg">
				{simulationTypeList.filter((x) => x.value === simType)[0]?.label}
			</p>

			<div className="w-full space-y-4 rounded border border-gray-200 p-2">
				<p>
					Upload the required CSV parameter file and CIF structure file. After
					the CIF is uploaded, detected elements appear below for optional
					per-element UPF upload. Each file must be{" "}
					<strong className="text-primary font-semibold">5 MB</strong> or less.
				</p>

				{files.length > 0 && (
					<div className="w-full space-y-4 rounded border border-gray-200 p-2">
						<p className="font-semibold text-lg">Uploaded Files: </p>

						<div className="w-full p-2 flex items-center gap-2 flex-wrap">
							{files.map((file, i) => (
								<div
									className="w-full rounded border border-gray-200 p-2 flex gap-1 items-center justify-between"
									key={file.name}
								>
									<p className="font-semibold text-sm truncate">{file.name}</p>

									<Button variant={"ghost"} onClick={() => handleRemoveFile(i)}>
										<XSquare color="red" />
									</Button>
								</div>
							))}
						</div>
					</div>
				)}

				<div className="w-full space-y-4 rounded border border-gray-200 p-2">
					<p className="font-semibold text-lg">Input Parameters</p>
					<p>
						Upload the ABINIT input parameters as a{" "}
						<strong className="text-primary font-semibold">CSV</strong> file.
					</p>

					<div className="flex items-center gap-4">
						<Button className="w-[50%]" variant={"outline"}>
							Download Template
						</Button>
						<Input
							className="w-[50%]"
							type="file"
							multiple={true}
							accept="*"
							onChange={handleFileChange}
						/>
					</div>
				</div>

				{optionalfiles.length > 0 && (
					<div className="w-full space-y-4 rounded border border-gray-200 p-2">
						<p className="font-semibold text-lg">Optional Uploaded Files: </p>

						<div className="w-full p-2 flex items-center gap-2 flex-wrap">
							{optionalfiles.map((file, i) => (
								<div
									className="w-full rounded border border-gray-200 p-2 flex gap-1 items-center justify-between"
									key={file.name}
								>
									<p className="font-semibold text-sm truncate">{file.name}</p>

									<Button
										variant={"ghost"}
										onClick={() => handleRemoveOptionalFile(i)}
									>
										<XSquare color="red" />
									</Button>
								</div>
							))}
						</div>
					</div>
				)}

				<div className="w-full space-y-4 rounded border border-gray-200 p-2">
					<p className="font-semibold text-lg">Psuedopotential Files</p>
					<p>
						Optional: upload one UPF file for each chemical element used, for
						example Au.UPF and Si.UPF
					</p>

					<div className="flex items-center gap-4">
						<Button className="w-[50%]" variant={"outline"}>
							Download Template
						</Button>
						<Input
							className="w-[50%]"
							type="file"
							multiple={true}
							accept="*"
							onChange={handleOptionalFileChange}
						/>
					</div>
				</div>
			</div>

			{/* <Button className="my-4 py-4 w-full text-lg" onClick={handleParamSubmit}>
				Run Simulation
			</Button> */}
		</div>
	);
};

export default ABINIT;

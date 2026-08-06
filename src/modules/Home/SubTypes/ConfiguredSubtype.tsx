import { XSquare } from "lucide-react";
import type { ChangeEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import FileUpload from "@/modules/Home/FileUpload";
import { simulationTypeList } from "@/modules/Home/SimUtils";
import type { ConfiguredSubtypeState } from "@/modules/Home/SubTypes/useConfiguredSubtype";

export type UploadSectionCopy = {
	accept?: string;
	ariaLabel: string;
	description: ReactNode;
	hint: string;
	title: string;
};

export type ConfiguredSubtypeCopy = {
	intro: string;
	optional: UploadSectionCopy;
	primary: UploadSectionCopy;
	summary: string;
};

type UploadedFilesProps = {
	files: File[];
	onRemove: (index: number) => void;
	title: string;
};

const UploadedFiles = ({ files, onRemove, title }: UploadedFilesProps) =>
	files.length > 0 ? (
		<div className="w-full space-y-4 rounded border border-gray-200 p-2">
			<p className="font-semibold text-lg">{title}</p>
			<div className="w-full p-2 flex items-center gap-2 flex-wrap">
				{files.map((file, index) => (
					<div
						className="w-full rounded border border-gray-200 p-2 flex gap-1 items-center justify-between"
						key={file.name}
					>
						<p className="font-semibold text-sm truncate">{file.name}</p>
						<Button
							aria-label={`Remove ${file.name}`}
							onClick={() => onRemove(index)}
							variant="ghost"
						>
							<XSquare aria-hidden="true" className="text-red-600" />
						</Button>
					</div>
				))}
			</div>
		</div>
	) : null;

type UploadSectionProps = {
	copy: UploadSectionCopy;
	disabled: boolean;
	files: File[];
	multiple?: boolean;
	onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

const UploadSection = ({
	copy,
	disabled,
	files,
	multiple,
	onChange,
}: UploadSectionProps) => {
	const accept = copy.accept ? { accept: copy.accept } : {};

	return (
		<div className="w-full space-y-4 rounded border border-gray-200 p-2">
			<p className="font-semibold text-lg">{copy.title}</p>
			<p>{copy.description}</p>
			<FileUpload
				{...accept}
				{...(multiple ? { multiple: true } : {})}
				ariaLabel={copy.ariaLabel}
				disabled={disabled}
				files={files}
				hint={copy.hint}
				onChange={onChange}
			/>
		</div>
	);
};

type ConfiguredSubtypeProps = ConfiguredSubtypeState & {
	copy: ConfiguredSubtypeCopy;
	isSubmitting: boolean;
	simType: string;
};

export const ConfiguredSubtype = ({
	copy,
	handleOptionalFileChange,
	handlePrimaryFileChange,
	handleRunSimulation,
	isSubmitting,
	optionalFiles,
	primaryFiles,
	removeOptionalFile,
	removePrimaryFile,
	simType,
}: ConfiguredSubtypeProps) => (
	<div className="w-full space-y-4">
		<p>{copy.intro}</p>
		<p className="font-semibold text-lg">
			{simulationTypeList.find((item) => item.value === simType)?.label}
		</p>

		<div className="w-full space-y-4 rounded border border-gray-200 p-2">
			<p>
				{copy.summary} Each file must be{" "}
				<strong className="text-primary font-semibold">5 MB</strong> or less.
			</p>

			<UploadedFiles
				files={primaryFiles}
				onRemove={removePrimaryFile}
				title="Uploaded Files: "
			/>
			<UploadSection
				copy={copy.primary}
				disabled={isSubmitting}
				files={primaryFiles}
				onChange={handlePrimaryFileChange}
			/>
			<UploadedFiles
				files={optionalFiles}
				onRemove={removeOptionalFile}
				title="Optional Uploaded Files: "
			/>
			<UploadSection
				copy={copy.optional}
				disabled={isSubmitting}
				files={optionalFiles}
				multiple
				onChange={handleOptionalFileChange}
			/>
		</div>

		<Button
			className="my-4 py-4 w-full text-lg"
			disabled={isSubmitting}
			onClick={handleRunSimulation}
		>
			{isSubmitting ? "Simulating" : "Run Simulation"}
		</Button>
	</div>
);

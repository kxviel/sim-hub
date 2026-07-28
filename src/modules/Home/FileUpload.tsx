import { Upload } from "lucide-react";
import { type ChangeEventHandler, useId } from "react";
import { cn } from "@/lib/utils";

type Props = {
	accept?: string;
	ariaLabel: string;
	className?: string;
	disabled?: boolean;
	files?: File[];
	hint?: string;
	id?: string;
	multiple?: boolean;
	onChange: ChangeEventHandler<HTMLInputElement>;
};

const FileUpload = ({
	accept,
	ariaLabel,
	className,
	disabled,
	files = [],
	hint,
	id,
	multiple = false,
	onChange,
}: Props) => {
	const generatedId = useId();
	const inputId = id ?? generatedId;
	const hasFiles = files.length > 0;
	const firstFile = files[0];
	const action = hasFiles
		? multiple
			? "Add Files"
			: "Replace File"
		: multiple
			? "Choose Files"
			: "Choose File";
	const detail = hasFiles
		? files.length === 1
			? firstFile?.name
			: `${files.length} files selected`
		: hint || (multiple ? "Select one or more files" : "No file selected");

	return (
		<label
			className={cn(
				"flex min-h-12 w-full touch-manipulation cursor-pointer items-center gap-3 rounded border border-gray-200 bg-muted/30 p-2 transition-[border-color,background-color,box-shadow] hover:border-primary/40 hover:bg-primary/5 focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/15",
				disabled && "pointer-events-none opacity-50",
				className,
			)}
			htmlFor={inputId}
		>
			<input
				accept={accept}
				aria-label={ariaLabel}
				className="sr-only"
				disabled={disabled}
				id={inputId}
				multiple={multiple}
				onChange={onChange}
				type="file"
			/>
			<span className="inline-flex shrink-0 items-center gap-2 rounded bg-background px-3 py-2 font-medium text-sm shadow-sm ring-1 ring-border">
				<Upload aria-hidden="true" className="size-4" />
				{action}
			</span>
			<span className="min-w-0 flex-1 truncate text-muted-foreground text-sm">
				{detail}
			</span>
		</label>
	);
};

export default FileUpload;

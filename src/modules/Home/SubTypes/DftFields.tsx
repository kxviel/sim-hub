import { XSquare } from "lucide-react";
import type { ChangeEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import FileUpload from "@/modules/Home/FileUpload";

type SelectedFileProps = {
	ariaLabel: string;
	file: File;
	onRemove: () => void;
};

export const SelectedFile = ({
	ariaLabel,
	file,
	onRemove,
}: SelectedFileProps) => (
	<div className="flex items-center justify-between gap-2 rounded border border-gray-200 p-2">
		<p className="min-w-0 truncate text-sm">{file.name}</p>
		<Button aria-label={ariaLabel} onClick={onRemove} variant="ghost">
			<XSquare aria-hidden="true" className="text-red-600" />
		</Button>
	</div>
);

type ElementPseudopotentialUploadsProps = {
	accept?: string;
	ariaLabelSuffix: string;
	children?: ReactNode;
	description: string;
	disabled: boolean;
	elements: string[];
	emptyMessage: string;
	files: Record<string, File | undefined>;
	hint: string;
	onChange: (element: string, event: ChangeEvent<HTMLInputElement>) => void;
	onRemove: (element: string) => void;
	warning: string | null;
};

export const ElementPseudopotentialUploads = ({
	accept,
	ariaLabelSuffix,
	children,
	description,
	disabled,
	elements,
	emptyMessage,
	files,
	hint,
	onChange,
	onRemove,
	warning,
}: ElementPseudopotentialUploadsProps) => {
	const heading = (
		<div>
			<p className="font-semibold text-lg">Detected CIF Elements</p>
			<p className="text-sm">{description}</p>
		</div>
	);
	const acceptedFormats = accept ? { accept } : {};

	return (
		<div className="w-full space-y-4 rounded border border-gray-200 p-2">
			{children ? (
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					{heading}
					{children}
				</div>
			) : (
				heading
			)}

			{warning ? (
				<p className="rounded border border-amber-300 bg-amber-50 p-3 text-amber-900 text-sm">
					{warning}
				</p>
			) : null}

			{elements.length > 0 ? (
				<div className="space-y-3">
					<p className="text-muted-foreground text-sm">
						{elements.length} element{elements.length === 1 ? "" : "s"} detected
					</p>
					{elements.map((element) => {
						const file = files[element];

						return (
							<div
								className="grid gap-3 rounded border border-gray-200 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:items-center"
								key={element}
							>
								<div className="min-w-0">
									<span className="inline-flex rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary text-sm">
										{element}
									</span>
									<p className="mt-1 text-muted-foreground text-xs">
										Atomic element from CIF
									</p>
								</div>
								<div className="flex min-w-0 items-center gap-2">
									{file ? (
										<>
											<p className="min-w-0 flex-1 truncate text-sm">
												{file.name}
											</p>
											<Button
												aria-label={`Remove ${element} pseudopotential`}
												onClick={() => onRemove(element)}
												variant="ghost"
											>
												<XSquare aria-hidden="true" className="text-red-600" />
											</Button>
										</>
									) : (
										<FileUpload
											{...acceptedFormats}
											ariaLabel={`${element} ${ariaLabelSuffix}`}
											disabled={disabled}
											hint={hint}
											onChange={(event) => onChange(element, event)}
										/>
									)}
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<p className="rounded border border-dashed border-gray-300 p-4 text-muted-foreground text-sm">
					{emptyMessage}
				</p>
			)}
		</div>
	);
};

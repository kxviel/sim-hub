import { ChevronRight } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { HomeState } from "@/modules/Home/useHome";

const AdvancedExecutionOptions = ({
	executionMemory,
	executionOptionsOpen,
	executionTime,
	executionTasksPerNode,
	handleExecutionMemoryChange,
	handleExecutionOptionsToggle,
	handleExecutionTimeChange,
	handleExecutionTasksPerNodeChange,
	isSubmitting,
}: HomeState) => (
	<details
		className="group w-full rounded border border-gray-200 bg-white"
		onToggle={handleExecutionOptionsToggle}
		open={executionOptionsOpen}
	>
		<summary className="flex cursor-pointer list-none items-center gap-2 p-3 font-semibold text-primary marker:content-none [&::-webkit-details-marker]:hidden">
			<ChevronRight
				aria-hidden="true"
				className="size-4 shrink-0 transition-transform group-open:rotate-90"
			/>
			Advanced Execution Options
		</summary>

		<FieldGroup className="grid gap-4 border-gray-200 border-t p-3 sm:grid-cols-3">
			<Field>
				<FieldLabel htmlFor="execution-memory">RAM Memory (MB)</FieldLabel>
				<Input
					disabled={isSubmitting}
					id="execution-memory"
					min="1"
					onChange={handleExecutionMemoryChange}
					placeholder="e.g. 4096"
					step="1"
					type="number"
					value={executionMemory}
				/>
			</Field>

			<Field>
				<FieldLabel htmlFor="execution-time">Time</FieldLabel>
				<Input
					autoComplete="off"
					disabled={isSubmitting}
					id="execution-time"
					inputMode="numeric"
					onChange={handleExecutionTimeChange}
					placeholder="00:20:00"
					type="text"
					value={executionTime}
				/>
			</Field>

			<Field>
				<FieldLabel htmlFor="execution-tasks-per-node">
					Tasks Per Node
				</FieldLabel>
				<Input
					disabled={isSubmitting}
					id="execution-tasks-per-node"
					min="1"
					onChange={handleExecutionTasksPerNodeChange}
					placeholder="e.g. 4"
					step="1"
					type="number"
					value={executionTasksPerNode}
				/>
			</Field>
		</FieldGroup>
	</details>
);

export default AdvancedExecutionOptions;

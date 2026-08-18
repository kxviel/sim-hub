import { ChevronRight } from "lucide-react";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { HomeState } from "@/modules/Home/useHome";

const AdvancedExecutionOptions = ({
	executionMemory,
	executionOptionErrors,
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
		className="@container/execution-options group w-full rounded border border-gray-200 bg-white"
		onToggle={handleExecutionOptionsToggle}
		open={executionOptionsOpen}
	>
		<summary className="flex cursor-pointer list-none items-center gap-2 p-3 font-semibold text-primary marker:content-none [&::-webkit-details-marker]:hidden">
			<ChevronRight
				aria-hidden="true"
				className="size-4 shrink-0 transition-transform group-open:rotate-90 motion-reduce:transition-none"
			/>
			Advanced Execution Options
		</summary>

		<FieldGroup className="grid gap-4 border-gray-200 border-t p-3 @sm/execution-options:grid-cols-2 @xl/execution-options:grid-cols-3">
			<Field data-invalid={Boolean(executionOptionErrors.executionMemory)}>
				<FieldLabel htmlFor="execution-memory">RAM Memory (GB)</FieldLabel>
				<Input
					aria-describedby={
						executionOptionErrors.executionMemory
							? "execution-memory-error"
							: undefined
					}
					aria-invalid={Boolean(executionOptionErrors.executionMemory)}
					disabled={isSubmitting}
					id="execution-memory"
					max="64"
					min="8"
					onChange={handleExecutionMemoryChange}
					placeholder="8 - 64"
					step="1"
					type="number"
					value={executionMemory}
				/>
				<FieldError id="execution-memory-error">
					{executionOptionErrors.executionMemory}
				</FieldError>
			</Field>

			<Field data-invalid={Boolean(executionOptionErrors.executionTime)}>
				<FieldLabel htmlFor="execution-time">Time</FieldLabel>
				<Input
					aria-describedby={
						executionOptionErrors.executionTime
							? "execution-time-error"
							: undefined
					}
					aria-invalid={Boolean(executionOptionErrors.executionTime)}
					autoComplete="off"
					disabled={isSubmitting}
					id="execution-time"
					inputMode="numeric"
					onChange={handleExecutionTimeChange}
					placeholder="00:20:00 - 24:00:00"
					type="text"
					value={executionTime}
				/>
				<FieldError id="execution-time-error">
					{executionOptionErrors.executionTime}
				</FieldError>
			</Field>

			<Field
				data-invalid={Boolean(executionOptionErrors.executionTasksPerNode)}
			>
				<FieldLabel htmlFor="execution-tasks-per-node">
					Tasks Per Node
				</FieldLabel>
				<Input
					aria-describedby={
						executionOptionErrors.executionTasksPerNode
							? "execution-tasks-per-node-error"
							: undefined
					}
					aria-invalid={Boolean(executionOptionErrors.executionTasksPerNode)}
					disabled={isSubmitting}
					id="execution-tasks-per-node"
					max="16"
					min="1"
					onChange={handleExecutionTasksPerNodeChange}
					placeholder="1 - 16"
					step="1"
					type="number"
					value={executionTasksPerNode}
				/>
				<FieldError id="execution-tasks-per-node-error">
					{executionOptionErrors.executionTasksPerNode}
				</FieldError>
			</Field>
		</FieldGroup>
	</details>
);

export default AdvancedExecutionOptions;

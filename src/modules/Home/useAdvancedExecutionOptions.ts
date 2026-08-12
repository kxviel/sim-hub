import { type ChangeEvent, type SyntheticEvent, useState } from "react";

export type AdvancedExecutionInputs = {
	mem: string | null;
	time: string | null;
	"tasks-per-node": string | null;
};

export type AdvancedExecutionOptionsState = {
	executionMemory: string;
	executionOptionsOpen: boolean;
	executionTime: string;
	executionTasksPerNode: string;
	handleExecutionMemoryChange: (event: ChangeEvent<HTMLInputElement>) => void;
	handleExecutionOptionsToggle: (
		event: SyntheticEvent<HTMLDetailsElement>,
	) => void;
	handleExecutionTimeChange: (event: ChangeEvent<HTMLInputElement>) => void;
	handleExecutionTasksPerNodeChange: (
		event: ChangeEvent<HTMLInputElement>,
	) => void;
};

const toNullableValue = (value: string) => value.trim() || null;

export const getAdvancedExecutionInputs = (
	state: Pick<
		AdvancedExecutionOptionsState,
		"executionMemory" | "executionTime" | "executionTasksPerNode"
	>,
): AdvancedExecutionInputs => ({
	mem: toNullableValue(state.executionMemory),
	time: toNullableValue(state.executionTime),
	"tasks-per-node": toNullableValue(state.executionTasksPerNode),
});

export const useAdvancedExecutionOptions =
	(): AdvancedExecutionOptionsState => {
		const [executionMemory, setExecutionMemory] = useState("");
		const [executionOptionsOpen, setExecutionOptionsOpen] = useState(true);
		const [executionTime, setExecutionTime] = useState("");
		const [executionTasksPerNode, setExecutionTasksPerNode] = useState("");

		const handleExecutionMemoryChange = (
			event: ChangeEvent<HTMLInputElement>,
		) => {
			setExecutionMemory(event.target.value);
		};

		const handleExecutionOptionsToggle = (
			event: SyntheticEvent<HTMLDetailsElement>,
		) => {
			setExecutionOptionsOpen(event.currentTarget.open);
		};

		const handleExecutionTimeChange = (
			event: ChangeEvent<HTMLInputElement>,
		) => {
			setExecutionTime(event.target.value);
		};

		const handleExecutionTasksPerNodeChange = (
			event: ChangeEvent<HTMLInputElement>,
		) => {
			setExecutionTasksPerNode(event.target.value);
		};

		return {
			executionMemory,
			executionOptionsOpen,
			executionTime,
			executionTasksPerNode,
			handleExecutionMemoryChange,
			handleExecutionOptionsToggle,
			handleExecutionTimeChange,
			handleExecutionTasksPerNodeChange,
		};
	};

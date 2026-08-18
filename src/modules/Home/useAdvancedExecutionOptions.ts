import { type ChangeEvent, type SyntheticEvent, useState } from "react";

export type AdvancedExecutionInputs = {
	mem: number | null;
	time: number | null;
	"tasks-per-node": number | null;
};

export type AdvancedExecutionOptionErrors = {
	executionMemory?: string;
	executionTime?: string;
	executionTasksPerNode?: string;
};

export type AdvancedExecutionOptionsState = {
	executionMemory: string;
	executionOptionErrors: AdvancedExecutionOptionErrors;
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
	resetExecutionOptions: () => void;
	validateExecutionOptions: () => AdvancedExecutionInputs | null;
};

const MEMORY_KB_PER_GB = 1024 * 1024;
const MIN_EXECUTION_SECONDS = 20 * 60;
const MAX_EXECUTION_SECONDS = 24 * 60 * 60;

const parseExecutionTime = (value: string) => {
	const match = value.trim().match(/^(\d{1,2}):([0-5]\d):([0-5]\d)$/);

	if (!match) {
		return null;
	}

	const [, hours, minutes, seconds] = match;
	const totalSeconds =
		Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);

	return totalSeconds >= MIN_EXECUTION_SECONDS &&
		totalSeconds <= MAX_EXECUTION_SECONDS
		? totalSeconds
		: null;
};

const getAdvancedExecutionOptionErrors = (
	executionMemory: string,
	executionTime: string,
	executionTasksPerNode: string,
) => {
	const errors: AdvancedExecutionOptionErrors = {};
	const memory = executionMemory.trim();
	const tasksPerNode = executionTasksPerNode.trim();
	const time = executionTime.trim();

	if (memory) {
		const value = Number(memory);

		if (!Number.isInteger(value) || value < 8 || value > 64) {
			errors.executionMemory = "RAM memory must be between 8 and 64 GB.";
		}
	}

	if (tasksPerNode) {
		const value = Number(tasksPerNode);

		if (!Number.isInteger(value) || value < 1 || value > 16) {
			errors.executionTasksPerNode = "Tasks per node must be between 1 and 16.";
		}
	}

	if (time && parseExecutionTime(time) === null) {
		errors.executionTime = "Time must be between 00:20:00 and 24:00:00.";
	}

	return errors;
};

const hasErrors = (errors: AdvancedExecutionOptionErrors) =>
	Object.values(errors).some(Boolean);

export const useAdvancedExecutionOptions =
	(): AdvancedExecutionOptionsState => {
		const [executionMemory, setExecutionMemory] = useState("");
		const [executionOptionErrors, setExecutionOptionErrors] =
			useState<AdvancedExecutionOptionErrors>({});
		const [executionOptionsOpen, setExecutionOptionsOpen] = useState(false);
		const [executionTime, setExecutionTime] = useState("");
		const [executionTasksPerNode, setExecutionTasksPerNode] = useState("");

		const clearError = (field: keyof AdvancedExecutionOptionErrors) => {
			setExecutionOptionErrors((currentErrors) => {
				if (!currentErrors[field]) {
					return currentErrors;
				}

				return { ...currentErrors, [field]: undefined };
			});
		};

		const handleExecutionMemoryChange = (
			event: ChangeEvent<HTMLInputElement>,
		) => {
			setExecutionMemory(event.target.value);
			clearError("executionMemory");
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
			clearError("executionTime");
		};

		const handleExecutionTasksPerNodeChange = (
			event: ChangeEvent<HTMLInputElement>,
		) => {
			setExecutionTasksPerNode(event.target.value);
			clearError("executionTasksPerNode");
		};

		const resetExecutionOptions = () => {
			setExecutionMemory("");
			setExecutionOptionErrors({});
			setExecutionOptionsOpen(false);
			setExecutionTime("");
			setExecutionTasksPerNode("");
		};

		const validateExecutionOptions = () => {
			const errors = getAdvancedExecutionOptionErrors(
				executionMemory,
				executionTime,
				executionTasksPerNode,
			);
			setExecutionOptionErrors(errors);

			if (hasErrors(errors)) {
				setExecutionOptionsOpen(true);
				return null;
			}

			const memory = executionMemory.trim();
			const tasksPerNode = executionTasksPerNode.trim();
			const time = executionTime.trim();

			return {
				mem: memory ? Number(memory) * MEMORY_KB_PER_GB : null,
				time: time ? parseExecutionTime(time) : null,
				"tasks-per-node": tasksPerNode ? Number(tasksPerNode) : null,
			};
		};

		return {
			executionMemory,
			executionOptionErrors,
			executionOptionsOpen,
			executionTime,
			executionTasksPerNode,
			handleExecutionMemoryChange,
			handleExecutionOptionsToggle,
			handleExecutionTimeChange,
			handleExecutionTasksPerNodeChange,
			resetExecutionOptions,
			validateExecutionOptions,
		};
	};

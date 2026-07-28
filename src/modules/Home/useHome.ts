import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { getAuthSession } from "@/modules/Auth/auth.session";
import {
	getProjectDownloadPath,
	getProjectResultAPI,
	isFatalResultError,
	resolveDownloadUrl,
	type SimulationResultData,
	useSimulation,
} from "@/modules/Home/home.api";
import { getSimulationSubtypeList } from "@/modules/Home/SimUtils";

const RESULT_POLL_INTERVAL = 5_000;

export type SimulationParameterValue = string | number | boolean | number[];

export type ConfiguredSimulationSubmission = {
	calculatorSlug: string;
	projectPrefix: string;
	simulatorLabel: string;
	parameters?: Record<string, SimulationParameterValue>;
	fileGroups?: {
		fieldName: string;
		files: File[];
	}[];
};

export type SubmissionStatus =
	| "idle"
	| "submitting"
	| "queued"
	| "completed"
	| "error";

export type SimulationSubmission = {
	status: SubmissionStatus;
	message: string;
	simulatorLabel: string;
	projectName: string;
	username: string;
	resultData: SimulationResultData | null;
	downloadUrl: string;
};

export type HomeState = {
	simType: string;
	simSubType: string;
	setupComplete: boolean;
	simulationSubtypeList: {
		label: string;
		value: string;
	}[];
	submission: SimulationSubmission;
	isSubmitting: boolean;
	isPolling: boolean;
	handleSimulationTypeChange: (value: string | null) => void;
	handleSimulationSubtypeChange: (value: string | null) => void;
	handleParamSubmit: (
		parameterFile: File,
		structureFile: File,
		pseudopotentialFiles: File[],
	) => void;
	handleConfiguredSubmit: (submission: ConfiguredSimulationSubmission) => void;
	handleDownloadResult: () => void;
};

const EMPTY_SUBMISSION: SimulationSubmission = {
	status: "idle",
	message: "",
	simulatorLabel: "",
	projectName: "",
	username: "",
	resultData: null,
	downloadUrl: "",
};

export const useHome = (): HomeState => {
	const [simType, setSimType] = useState("");
	const [simSubType, setSimSubType] = useState("");
	const [setupComplete, setSetupComplete] = useState(false);
	const [submission, setSubmission] = useState(EMPTY_SUBMISSION);
	const activeRequest = useRef(0);

	const runSimulation = useSimulation();
	const simulationSubtypeList = getSimulationSubtypeList(simType);
	const canPoll =
		submission.status === "queued" &&
		Boolean(submission.username && submission.projectName);

	const projectResult = useQuery({
		queryKey: [
			"simulation-result",
			submission.username,
			submission.projectName,
		],
		queryFn: () =>
			getProjectResultAPI(submission.username, submission.projectName),
		enabled: canPoll,
		refetchInterval: (query) =>
			query.state.data?.ready || isFatalResultError(query.state.error)
				? false
				: RESULT_POLL_INTERVAL,
		refetchOnWindowFocus: false,
		retry: false,
	});

	let currentSubmission = submission;

	if (submission.status === "queued" && projectResult.data) {
		currentSubmission = projectResult.data.ready
			? {
					...submission,
					status: "completed",
					message:
						projectResult.data.message || "Simulation results are ready.",
					resultData: projectResult.data.resultData,
					downloadUrl:
						projectResult.data.downloadUrl ||
						getProjectDownloadPath(submission.username, submission.projectName),
				}
			: {
					...submission,
					message: projectResult.data.message || submission.message,
				};
	}

	if (
		submission.status === "queued" &&
		isFatalResultError(projectResult.error)
	) {
		currentSubmission = {
			...submission,
			status: "error",
			message:
				projectResult.error instanceof Error
					? projectResult.error.message
					: "Unable to retrieve simulation results.",
		};
	}

	const resetSubmission = () => {
		activeRequest.current += 1;
		runSimulation.reset();
		setSubmission(EMPTY_SUBMISSION);
	};

	const handleSimulationTypeChange = (value: string | null) => {
		setSimType(value ?? "");
		setSimSubType("");
		setSetupComplete(false);
		resetSubmission();
	};

	const handleSimulationSubtypeChange = (value: string | null) => {
		setSimSubType(value ?? "");
		setSetupComplete(Boolean(simType && value));
		resetSubmission();
	};

	const submitSimulation = async (
		config: {
			calculatorSlug: string;
			simulatorLabel: string;
			projectName: string;
		},
		formData: FormData,
	) => {
		const requestId = activeRequest.current + 1;
		activeRequest.current = requestId;
		const username = getAuthSession()?.username ?? "";

		if (!username) {
			toast.error("Sign in before running a simulation.");
			return;
		}

		setSubmission({
			...EMPTY_SUBMISSION,
			status: "submitting",
			message: "Submitting simulation files...",
			simulatorLabel: config.simulatorLabel,
			projectName: config.projectName,
			username,
		});

		try {
			const response = await runSimulation.mutateAsync({
				subtypeSlug: config.calculatorSlug,
				usernameSlug: encodeURIComponent(username),
				projectName: config.projectName,
				formData,
			});

			if (requestId !== activeRequest.current) {
				return;
			}

			setSubmission({
				status: response.ready ? "completed" : "queued",
				message:
					response.message ||
					(response.ready
						? "Simulation results are ready."
						: "Simulation submitted. Waiting for results..."),
				simulatorLabel: config.simulatorLabel,
				projectName: response.projectName,
				username,
				resultData: response.resultData,
				downloadUrl: response.downloadUrl,
			});

			toast.success(`${config.simulatorLabel} simulation submitted.`);
		} catch (error) {
			if (requestId !== activeRequest.current) {
				return;
			}

			const message =
				error instanceof Error
					? error.message
					: "Unable to submit the simulation.";

			setSubmission({
				...EMPTY_SUBMISSION,
				status: "error",
				message,
				simulatorLabel: config.simulatorLabel,
				projectName: config.projectName,
				username,
			});
			toast.error(message);
		}
	};

	const handleParamSubmit = (
		parameterFile: File,
		structureFile: File,
		pseudopotentialFiles: File[],
	) => {
		const projectName = `DFT_quantum_espresso_${Date.now()}`;
		const formData = new FormData();
		formData.append("proj_name", projectName);
		formData.append("csv_file", parameterFile);
		formData.append("structure_file", structureFile);

		for (const file of pseudopotentialFiles) {
			formData.append("pseudofiles", file);
		}

		void submitSimulation(
			{
				calculatorSlug: "Quantum-Espresso",
				simulatorLabel: "Quantum ESPRESSO",
				projectName,
			},
			formData,
		);
	};

	const handleConfiguredSubmit = (
		configuredSubmission: ConfiguredSimulationSubmission,
	) => {
		const projectName = `${configuredSubmission.projectPrefix}_${Date.now()}`;
		const formData = new FormData();
		formData.append("proj_name", projectName);

		if (configuredSubmission.parameters) {
			formData.append(
				"parameters",
				JSON.stringify(configuredSubmission.parameters),
			);
		}

		for (const group of configuredSubmission.fileGroups ?? []) {
			for (const file of group.files) {
				formData.append(group.fieldName, file);
			}
		}

		void submitSimulation(
			{
				calculatorSlug: configuredSubmission.calculatorSlug,
				simulatorLabel: configuredSubmission.simulatorLabel,
				projectName,
			},
			formData,
		);
	};

	const handleDownloadResult = () => {
		if (!currentSubmission.username || !currentSubmission.projectName) {
			return;
		}

		const downloadPath =
			currentSubmission.downloadUrl ||
			getProjectDownloadPath(
				currentSubmission.username,
				currentSubmission.projectName,
			);
		const link = document.createElement("a");
		link.href = resolveDownloadUrl(downloadPath);
		link.download = "";
		link.rel = "noopener noreferrer";
		document.body.appendChild(link);
		link.click();
		link.remove();

		setSubmission({
			...currentSubmission,
			message: "Result download started.",
		});
	};

	return {
		simType,
		simSubType,
		setupComplete,
		simulationSubtypeList,
		submission: currentSubmission,
		isSubmitting: runSimulation.isPending,
		isPolling: currentSubmission.status === "queued",
		handleSimulationTypeChange,
		handleSimulationSubtypeChange,
		handleParamSubmit,
		handleConfiguredSubmit,
		handleDownloadResult,
	};
};

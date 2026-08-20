import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { getAuthSession } from "@/modules/Auth/auth.session";
import {
	getProjectDownloadPath,
	getProjectResultAPI,
	isFatalResultError,
	type SimulationResultData,
	type SimulationRunEndpoint,
	useSimulation,
} from "@/modules/Home/home.api";
import { getSimulationSubtypeList } from "@/modules/Home/SimUtils";
import {
	type AdvancedExecutionInputs,
	type AdvancedExecutionOptionsState,
	useAdvancedExecutionOptions,
} from "@/modules/Home/useAdvancedExecutionOptions";
import { downloadSimulationResult } from "@/modules/Home/useSimulationResults";

const RESULT_POLL_INTERVAL = 5_000;

export type SimulationParameterValue = string | number | boolean | number[];

export type ConfiguredSimulationSubmission = {
	calculatorSlug: string;
	extraInputs?: Record<string, unknown>;
	localPrototype?: boolean;
	projectPrefix: string;
	simulatorLabel: string;
	parameters?: Record<string, SimulationParameterValue>;
	formFields?: Record<string, string>;
	fileGroups?: {
		fieldName: string;
		files: File[];
	}[];
	runEndpoint?: SimulationRunEndpoint;
};

export type SubmissionStatus =
	| "idle"
	| "submitting"
	| "queued"
	| "running"
	| "prototype"
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

export type HomeState = AdvancedExecutionOptionsState & {
	canLoadHistory: boolean;
	currentUsername: string;
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
	isRefreshingResults: boolean;
	isDownloadingResult: boolean;
	handleSimulationTypeChange: (value: string | null) => void;
	handleSimulationSubtypeChange: (value: string | null) => void;
	handleParamSubmit: (
		parameterFile: File,
		structureFile: File,
		pseudopotentialFiles: File[],
	) => void;
	handleConfiguredSubmit: (submission: ConfiguredSimulationSubmission) => void;
	handleDownloadResult: () => Promise<void>;
	handleRefreshResults: () => Promise<void>;
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

const RUNNING_STATUSES = new Set(["ongoing", "running", "started"]);

const appendExtraInputs = (
	formData: FormData,
	extraInputs: Record<string, unknown>,
	executionInputs: AdvancedExecutionInputs,
) => {
	const isAdvanced =
		typeof extraInputs.is_advanced === "boolean"
			? extraInputs.is_advanced
			: false;
	const combinedInputs = {
		...extraInputs,
		is_advanced: isAdvanced,
		...executionInputs,
	};

	formData.append("extra_inputs", JSON.stringify(combinedInputs));

	formData.append("is_advanced", String(combinedInputs.is_advanced));
};

export const useHome = (): HomeState => {
	const [simType, setSimType] = useState("");
	const [simSubType, setSimSubType] = useState("");
	const [setupComplete, setSetupComplete] = useState(false);
	const [submission, setSubmission] = useState(EMPTY_SUBMISSION);
	const [isDownloadingResult, setIsDownloadingResult] = useState(false);
	const activeRequest = useRef(0);
	const authSession = getAuthSession();
	const currentUsername = authSession?.username ?? "";
	const canLoadHistory = Boolean(authSession && !authSession.isTemporary);
	const advancedExecutionOptions = useAdvancedExecutionOptions();

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
			query.state.data?.ready ||
			query.state.data?.failed ||
			isFatalResultError(query.state.error)
				? false
				: RESULT_POLL_INTERVAL,
		refetchOnWindowFocus: false,
		retry: false,
	});

	let currentSubmission = submission;

	if (submission.status === "queued" && projectResult.data) {
		currentSubmission = projectResult.data.failed
			? {
					...submission,
					status: "error",
					message:
						projectResult.data.message ||
						"Simulation failed in middle logic or the backend.",
					resultData: projectResult.data.resultData,
					downloadUrl: "",
				}
			: projectResult.data.ready
				? {
						...submission,
						status: "completed",
						message:
							projectResult.data.message || "Simulation results are ready.",
						resultData: projectResult.data.resultData,
						downloadUrl:
							projectResult.data.downloadUrl ||
							getProjectDownloadPath(
								submission.username,
								submission.projectName,
							),
					}
				: {
						...submission,
						status: RUNNING_STATUSES.has(projectResult.data.status)
							? "running"
							: "queued",
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
		advancedExecutionOptions.resetExecutionOptions();
		resetSubmission();
	};

	const handleSimulationSubtypeChange = (value: string | null) => {
		setSimSubType(value ?? "");
		setSetupComplete(Boolean(simType && value));
		advancedExecutionOptions.resetExecutionOptions();
		resetSubmission();
	};

	const submitSimulation = async (
		config: {
			calculatorSlug: string;
			runEndpoint: SimulationRunEndpoint;
			simulatorLabel: string;
			projectName: string;
		},
		formData: FormData,
	) => {
		const requestId = activeRequest.current + 1;
		activeRequest.current = requestId;
		const username = currentUsername;

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
				runEndpoint: config.runEndpoint,
				subtypeSlug: config.calculatorSlug,
				usernameSlug: encodeURIComponent(username),
				projectName: config.projectName,
				formData,
			});

			if (requestId !== activeRequest.current) {
				return;
			}

			if (response.failed) {
				const message =
					response.message ||
					"Simulation failed in middle logic or the backend.";
				setSubmission({
					...EMPTY_SUBMISSION,
					status: "error",
					message,
					simulatorLabel: config.simulatorLabel,
					projectName: response.projectName,
					username,
					resultData: response.resultData,
				});
				toast.error(message);
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
		const executionInputs = advancedExecutionOptions.validateExecutionOptions();

		if (!executionInputs) {
			toast.error("Please fix the highlighted execution options.");
			return;
		}

		const projectName = `DFT_quantum_espresso_${Date.now()}`;
		const formData = new FormData();
		formData.append("proj_name", projectName);
		formData.append("csv_file", parameterFile);
		formData.append("structure_file", structureFile);

		for (const file of pseudopotentialFiles) {
			formData.append("pseudofiles", file);
		}

		appendExtraInputs(
			formData,
			{
				is_advanced: pseudopotentialFiles.length > 0,
			},
			executionInputs,
		);

		void submitSimulation(
			{
				calculatorSlug: "Quantum-Espresso",
				runEndpoint: "csv",
				simulatorLabel: "Quantum ESPRESSO",
				projectName,
			},
			formData,
		);
	};

	const handleConfiguredSubmit = (
		configuredSubmission: ConfiguredSimulationSubmission,
	) => {
		if (configuredSubmission.localPrototype) {
			activeRequest.current += 1;
			runSimulation.reset();
			setSubmission({
				...EMPTY_SUBMISSION,
				status: "prototype",
				message:
					"Files validated locally. Backend execution is not available for this prototype yet.",
				simulatorLabel: configuredSubmission.simulatorLabel,
				projectName: `${configuredSubmission.projectPrefix}_prototype`,
				username: currentUsername,
			});
			toast.success(
				`${configuredSubmission.simulatorLabel} prototype inputs are ready.`,
			);
			return;
		}

		const executionInputs = advancedExecutionOptions.validateExecutionOptions();

		if (!executionInputs) {
			toast.error("Please fix the highlighted execution options.");
			return;
		}

		const projectName = `${configuredSubmission.projectPrefix}_${Date.now()}`;
		const formData = new FormData();
		formData.append("proj_name", projectName);

		if (configuredSubmission.parameters) {
			formData.append(
				"parameters",
				JSON.stringify(configuredSubmission.parameters),
			);
		}

		appendExtraInputs(
			formData,
			configuredSubmission.extraInputs ?? {},
			executionInputs,
		);

		for (const [fieldName, value] of Object.entries(
			configuredSubmission.formFields ?? {},
		)) {
			formData.append(fieldName, value);
		}

		for (const group of configuredSubmission.fileGroups ?? []) {
			for (const file of group.files) {
				formData.append(group.fieldName, file);
			}
		}

		void submitSimulation(
			{
				calculatorSlug: configuredSubmission.calculatorSlug,
				runEndpoint: configuredSubmission.runEndpoint ?? "csv",
				simulatorLabel: configuredSubmission.simulatorLabel,
				projectName,
			},
			formData,
		);
	};

	const handleDownloadResult = async () => {
		if (!currentSubmission.username || !currentSubmission.projectName) {
			return;
		}

		const downloadPath =
			currentSubmission.downloadUrl ||
			getProjectDownloadPath(
				currentSubmission.username,
				currentSubmission.projectName,
			);

		try {
			setIsDownloadingResult(true);
			await downloadSimulationResult(
				downloadPath,
				currentSubmission.projectName,
			);
			toast.success("Result download started.");
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Unable to download the simulation result.";
			toast.error(message);
		} finally {
			setIsDownloadingResult(false);
		}
	};

	const handleRefreshResults = async () => {
		if (!canPoll) {
			return;
		}

		await projectResult.refetch();
	};

	return {
		...advancedExecutionOptions,
		canLoadHistory,
		currentUsername,
		simType,
		simSubType,
		setupComplete,
		simulationSubtypeList,
		submission: currentSubmission,
		isSubmitting: runSimulation.isPending,
		isPolling: ["queued", "running"].includes(currentSubmission.status),
		isRefreshingResults: projectResult.isFetching,
		isDownloadingResult,
		handleSimulationTypeChange,
		handleSimulationSubtypeChange,
		handleParamSubmit,
		handleConfiguredSubmit,
		handleDownloadResult,
		handleRefreshResults,
	};
};

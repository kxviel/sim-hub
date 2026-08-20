import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	getProjectDownloadPath,
	getSimulationHistoryAPI,
	normalizeSimulationStatus,
	type SimulationHistoryItem,
} from "@/modules/Home/home.api";
import type { SimulationSubmission } from "@/modules/Home/useHome";
import {
	downloadSimulationResult,
	getSummaryResultRows,
} from "@/modules/Home/useSimulationResults";

const HISTORY_POLL_INTERVAL = 5_000;
const DOWNLOADABLE_STATUSES = new Set([
	"completed",
	"downloaded",
	"finished",
	"success",
	"successful",
]);

const formatWords = (value: string) =>
	value
		.replace(/[_-]+/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.replace(/\b\w/g, (character) => character.toUpperCase());

const formatDate = (value: string) => {
	if (!value) {
		return "";
	}

	const date = new Date(value);

	return Number.isNaN(date.getTime())
		? value
		: new Intl.DateTimeFormat(undefined, {
				dateStyle: "medium",
				timeStyle: "short",
			}).format(date);
};

export const getHistoryRunDetails = (project: SimulationHistoryItem) =>
	[
		formatWords(project.calculator),
		formatWords(project.status),
		formatDate(project.createdAt),
	]
		.filter(Boolean)
		.join(" · ") || "Saved run";

export const getHistoryRunSummary = (project: SimulationHistoryItem) =>
	getSummaryResultRows(project.resultSummary);

export const canDownloadHistoryRun = (project: SimulationHistoryItem) =>
	DOWNLOADABLE_STATUSES.has(normalizeSimulationStatus(project.status));

const getHistoryStatusMessage = ({
	username,
	isPending,
	error,
	projectCount,
}: {
	username: string;
	isPending: boolean;
	error: unknown;
	projectCount: number;
}) => {
	if (!username) {
		return "Sign in to load simulation history.";
	}

	if (isPending) {
		return "Loading past runs…";
	}

	if (error) {
		return "Past runs couldn’t be loaded. Check the Middle-logic URL and try again.";
	}

	return projectCount > 0
		? `${projectCount} run${projectCount === 1 ? "" : "s"} found.`
		: "No past runs yet.";
};

export const useSimulationHistory = (
	username: string,
	submission: SimulationSubmission,
) => {
	const isActive = ["submitting", "queued", "running"].includes(
		submission.status,
	);
	const settledStatus = ["completed", "error"].includes(submission.status)
		? submission.status
		: "active";
	const history = useQuery({
		queryKey: [
			"simulation-history",
			username,
			submission.projectName,
			settledStatus,
		],
		queryFn: () => getSimulationHistoryAPI(username),
		enabled: Boolean(username),
		placeholderData: (previousData) => previousData,
		refetchInterval: isActive ? HISTORY_POLL_INTERVAL : false,
		refetchOnWindowFocus: false,
		retry: false,
	});
	const projects = history.data ?? [];
	const statusMessage = getHistoryStatusMessage({
		username,
		isPending: history.isPending,
		error: history.error,
		projectCount: projects.length,
	});

	const handleDownloadHistoryRun = async (project: SimulationHistoryItem) => {
		if (!canDownloadHistoryRun(project)) {
			return;
		}

		try {
			await downloadSimulationResult(
				getProjectDownloadPath(username, project.projectName),
				project.projectName,
			);
			toast.success(`${project.projectName} download started.`);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: `Could not download ${project.projectName}.`,
			);
		}
	};

	return {
		handleDownloadHistoryRun,
		handleRetry: () => void history.refetch(),
		isError: history.isError,
		isRefreshing: history.isFetching,
		projects,
		statusMessage,
	};
};

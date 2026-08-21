import { Download, RefreshCw, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionTitle from "@/modules/Home/SectionTitle";
import SimulationHistory from "@/modules/Home/SimulationHistory";
import SimulationNotifications from "@/modules/Home/SimulationNotifications";
import type { HomeState, SubmissionStatus } from "@/modules/Home/useHome";
import {
	getSimulationMetadataRows,
	getSimulationResultRows,
} from "@/modules/Home/useSimulationResults";

const STATUS_LABELS: Record<SubmissionStatus, string> = {
	idle: "Not Started",
	submitting: "Submitting",
	queued: "Queued",
	running: "Running",
	prototype: "Prototype",
	completed: "Completed",
	error: "Error",
};

const ResultRow = ({ label, value }: { label: string; value: string }) => (
	<div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-4 border-border border-b py-2.5 last:border-0">
		<p className="text-muted-foreground text-xs">{label}</p>
		<p className="min-w-0 text-right text-xs [overflow-wrap:anywhere]">
			{value}
		</p>
	</div>
);

const SimulationResults = ({
	canLoadHistory,
	setupComplete,
	submission,
	isPolling,
	isRefreshingResults,
	isDownloadingResult,
	currentUsername,
	handleDownloadResult,
	handleRefreshResults,
}: HomeState) => {
	const metadataRows = getSimulationMetadataRows(submission);
	const resultRows = getSimulationResultRows(submission);
	const showCurrentResult = setupComplete && submission.status !== "idle";

	return (
		<div className="workspace-panel space-y-4">
			<SectionTitle title="Simulation Results" icon={<ScrollText />} />
			<SimulationNotifications />

			{showCurrentResult ? (
				<>
					<div
						aria-live={submission.status === "error" ? "assertive" : "polite"}
						className={`rounded-md border p-4 ${
							submission.status === "error"
								? "border-foreground/25 bg-background text-foreground"
								: "border-primary/20 bg-primary/5 text-foreground"
						}`}
						role={submission.status === "error" ? "alert" : "status"}
					>
						<div className="flex flex-wrap items-start justify-between gap-3">
							<p className="inline-flex items-center gap-2 font-semibold text-sm">
								<span
									aria-hidden="true"
									className={`size-2 rounded-full ${
										submission.status === "error"
											? "bg-foreground"
											: "bg-primary"
									}`}
								/>
								{STATUS_LABELS[submission.status]}
							</p>
							{isPolling ? (
								<Button
									aria-label="Refresh simulation status"
									className="shrink-0"
									disabled={isRefreshingResults}
									onClick={() => void handleRefreshResults()}
									size="sm"
									type="button"
									variant="outline"
								>
									<RefreshCw
										aria-hidden="true"
										className={
											isRefreshingResults
												? "animate-spin motion-reduce:animate-none"
												: undefined
										}
									/>
									{isRefreshingResults ? "Refreshing…" : "Refresh"}
								</Button>
							) : null}
						</div>
						<p className="mt-1 text-sm">{submission.message}</p>
						{isPolling ? (
							<p className="mt-2 text-muted-foreground text-xs">
								Checking for results every 5 seconds.
							</p>
						) : null}
					</div>

					<div className="rounded-md border border-border p-4">
						<p className="mb-2 font-semibold text-sm">Simulation Summary</p>
						<ResultRow
							label="Status"
							value={STATUS_LABELS[submission.status]}
						/>
						<ResultRow label="Calculator" value={submission.simulatorLabel} />
						<ResultRow label="Project" value={submission.projectName} />
						<ResultRow label="Submitted By" value={submission.username} />

						{metadataRows.map(({ key, label, value }) => (
							<ResultRow key={key} label={label} value={value} />
						))}

						{resultRows.map(({ key, label, value }) => (
							<ResultRow key={key} label={label} value={value} />
						))}
					</div>

					{submission.status === "completed" ? (
						<Button
							className="w-full"
							disabled={isDownloadingResult}
							onClick={handleDownloadResult}
						>
							<Download data-icon="inline-start" />
							{isDownloadingResult ? "Preparing Download…" : "Download Result"}
						</Button>
					) : null}
				</>
			) : (
				<div className="flex min-h-36 items-center justify-center rounded-md border border-border border-dashed bg-background/60 px-4 text-center">
					<p className="max-w-56 text-muted-foreground text-sm leading-relaxed">
						Results will appear here after running the simulation.
					</p>
				</div>
			)}

			{canLoadHistory ? (
				<SimulationHistory submission={submission} username={currentUsername} />
			) : null}
		</div>
	);
};

export default SimulationResults;

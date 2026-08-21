import { Download, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SimulationSubmission } from "@/modules/Home/useHome";
import {
	canDownloadHistoryRun,
	getHistoryRunDetails,
	getHistoryRunSummary,
	useSimulationHistory,
} from "@/modules/Home/useSimulationHistory";

type SimulationHistoryProps = {
	username: string;
	submission: SimulationSubmission;
};

const SimulationHistory = ({
	username,
	submission,
}: SimulationHistoryProps) => {
	const {
		handleDownloadHistoryRun,
		handleRetry,
		isError,
		isRefreshing,
		projects,
		statusMessage,
	} = useSimulationHistory(username, submission);

	return (
		<section
			aria-labelledby="past-runs-title"
			className="rounded-md border border-border p-4"
		>
			<h2 className="font-semibold text-sm" id="past-runs-title">
				Past Runs
			</h2>
			<div className="mt-1 flex flex-wrap items-center justify-between gap-3">
				<p
					aria-live="polite"
					className="min-w-0 flex-1 text-muted-foreground text-sm"
				>
					{statusMessage}
				</p>
				{isError ? (
					<Button
						className="shrink-0"
						disabled={isRefreshing}
						onClick={handleRetry}
						size="sm"
						type="button"
						variant="outline"
					>
						<RotateCw
							aria-hidden="true"
							className={
								isRefreshing
									? "animate-spin motion-reduce:animate-none"
									: undefined
							}
						/>
						{isRefreshing ? "Retrying…" : "Retry"}
					</Button>
				) : null}
			</div>

			{projects.length > 0 ? (
				<div className="mt-3 space-y-3">
					{projects.map((project) => {
						const summaryRows = getHistoryRunSummary(project);
						const canDownload = canDownloadHistoryRun(project);

						return (
							<article
								className="rounded-md border border-border bg-background/35 p-3"
								key={project.projectName}
							>
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0">
										<h3 className="wrap-break-word font-medium">
											{project.projectName}
										</h3>
										<p className="mt-1 text-muted-foreground text-xs [overflow-wrap:anywhere]">
											{getHistoryRunDetails(project)}
										</p>
									</div>
									<Button
										aria-label={`Download ${project.projectName}`}
										disabled={!canDownload}
										onClick={() => void handleDownloadHistoryRun(project)}
										size="sm"
										title={
											canDownload
												? undefined
												: "Results are available after a successful run."
										}
										variant="outline"
									>
										<Download aria-hidden="true" />
										Download
									</Button>
								</div>

								{summaryRows.length > 0 ? (
									<dl className="mt-3 grid gap-2 border-border border-t pt-3">
										{summaryRows.map(({ key, label, value }) => (
											<div className="flex justify-between gap-3" key={key}>
												<dt className="text-muted-foreground text-xs">
													{label}
												</dt>
												<dd className="min-w-0 text-right text-xs [overflow-wrap:anywhere]">
													{value}
												</dd>
											</div>
										))}
									</dl>
								) : null}
							</article>
						);
					})}
				</div>
			) : null}
		</section>
	);
};

export default SimulationHistory;

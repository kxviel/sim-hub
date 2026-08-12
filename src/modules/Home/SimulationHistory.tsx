import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SimulationSubmission } from "@/modules/Home/useHome";
import {
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
	const { handleDownloadHistoryRun, isError, projects, statusMessage } =
		useSimulationHistory(username, submission);

	return (
		<section aria-labelledby="past-runs-title" className="rounded border p-4">
			<h2 className="font-semibold" id="past-runs-title">
				Past Runs
			</h2>
			<p
				aria-live="polite"
				className={`mt-1 text-sm ${isError ? "text-destructive" : "text-muted-foreground"}`}
			>
				{statusMessage}
			</p>

			{projects.length > 0 ? (
				<div className="mt-3 space-y-3">
					{projects.map((project) => {
						const summaryRows = getHistoryRunSummary(project);

						return (
							<article
								className="rounded border border-gray-200 p-3"
								key={project.projectName}
							>
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0">
										<h3 className="wrap-break-word font-medium">
											{project.projectName}
										</h3>
										<p className="mt-1 text-muted-foreground text-xs">
											{getHistoryRunDetails(project)}
										</p>
									</div>
									<Button
										aria-label={`Download ${project.projectName}`}
										onClick={() =>
											void handleDownloadHistoryRun(project.projectName)
										}
										size="sm"
										variant="outline"
									>
										<Download aria-hidden="true" />
										Download
									</Button>
								</div>

								{summaryRows.length > 0 ? (
									<dl className="mt-3 grid gap-2 border-gray-100 border-t pt-3">
										{summaryRows.map(({ key, label, value }) => (
											<div className="flex justify-between gap-3" key={key}>
												<dt className="text-muted-foreground text-xs">
													{label}
												</dt>
												<dd className="text-right text-xs">{value}</dd>
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

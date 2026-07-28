import { Download, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionTitle from "@/modules/Home/SectionTitle";
import type { HomeState, SubmissionStatus } from "@/modules/Home/useHome";

const RESULT_FIELDS = [
	{ key: "energy", label: "Energy" },
	{ key: "fermi_energy", label: "Fermi Energy" },
	{ key: "volume", label: "Volume" },
	{ key: "scf_iterations", label: "SCF Iterations" },
];

const STATUS_LABELS: Record<SubmissionStatus, string> = {
	idle: "Not Started",
	submitting: "Submitting",
	queued: "Queued",
	completed: "Completed",
	error: "Error",
};

const ResultRow = ({ label, value }: { label: string; value: unknown }) => (
	<div className="flex justify-between gap-4 border-gray-100 border-b py-2 last:border-0">
		<p className="text-muted-foreground text-sm">{label}</p>
		<p className="min-w-0 break-words text-right text-sm">{String(value)}</p>
	</div>
);

const SimulationResults = ({
	setupComplete,
	submission,
	isPolling,
	handleDownloadResult,
}: HomeState) => {
	if (!setupComplete || submission.status === "idle") {
		return (
			<div className="h-full min-h-0 w-full space-y-4 overflow-y-auto rounded border border-gray-200 bg-white p-6">
				<SectionTitle title="Simulation Results" icon={<ScrollText />} />
				<p className="text-muted-foreground">
					Results will appear here after running the simulation.
				</p>
			</div>
		);
	}

	return (
		<div className="h-full min-h-0 w-full space-y-4 overflow-y-auto rounded border border-gray-200 bg-white p-6">
			<SectionTitle title="Simulation Results" icon={<ScrollText />} />

			<div
				aria-live="polite"
				className={`rounded border p-4 ${
					submission.status === "error"
						? "border-red-200 bg-red-50 text-red-900"
						: "border-primary/20 bg-primary/5 text-foreground"
				}`}
			>
				<p className="font-semibold">{STATUS_LABELS[submission.status]}</p>
				<p className="mt-1 text-sm">{submission.message}</p>
				{isPolling ? (
					<p className="mt-2 text-muted-foreground text-xs">
						Checking for results every 5 seconds.
					</p>
				) : null}
			</div>

			<div className="rounded border border-gray-200 p-4">
				<p className="mb-2 font-semibold">Simulation Summary</p>
				<ResultRow label="Status" value={STATUS_LABELS[submission.status]} />
				<ResultRow label="Calculator" value={submission.simulatorLabel} />
				<ResultRow label="Project" value={submission.projectName} />
				<ResultRow label="Submitted By" value={submission.username} />

				{RESULT_FIELDS.map(({ key, label }) => {
					const value = submission.resultData?.[key];

					return value === undefined ||
						value === null ||
						value === "" ? null : (
						<ResultRow key={key} label={label} value={value} />
					);
				})}
			</div>

			{submission.status === "completed" ? (
				<Button className="w-full" onClick={handleDownloadResult}>
					<Download data-icon="inline-start" />
					Download Result
				</Button>
			) : null}
		</div>
	);
};

export default SimulationResults;

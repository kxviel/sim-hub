import { CircleCheck, CircleX, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSimulationNotifications } from "@/modules/Home/useSimulationNotifications";

const SimulationNotifications = () => {
	const {
		dismissNotification,
		downloadNotificationResult,
		downloadingIndex,
		notifications,
	} = useSimulationNotifications();

	if (notifications.length === 0) {
		return null;
	}

	return (
		<section
			aria-labelledby="run-notifications-title"
			className="rounded border border-primary/20 bg-primary/5 p-4"
		>
			<h2 className="font-semibold" id="run-notifications-title">
				Run Notifications
			</h2>
			<p className="mt-1 text-muted-foreground text-sm">
				Updates received since your last sign-in.
			</p>

			<ul className="mt-3 space-y-2">
				{notifications.map((notification) => (
					<li
						className="flex flex-wrap items-center gap-3 rounded border border-gray-200 bg-white p-3"
						key={notification.projectName}
					>
						{notification.success ? (
							<CircleCheck
								aria-hidden="true"
								className="size-5 shrink-0 text-primary"
							/>
						) : (
							<CircleX
								aria-hidden="true"
								className="size-5 shrink-0 text-destructive"
							/>
						)}
						<div className="min-w-0 flex-1">
							<p className="wrap-break-word font-medium text-sm">
								{notification.projectName}
							</p>
							<p className="text-muted-foreground text-xs">
								{notification.success
									? "Simulation completed successfully."
									: "Simulation failed."}
							</p>
						</div>

						{notification.success ? (
							<Button
								disabled={downloadingIndex === notification.index}
								onClick={() => void downloadNotificationResult(notification)}
								size="sm"
								variant="outline"
							>
								<Download aria-hidden="true" />
								{downloadingIndex === notification.index
									? "Downloading…"
									: "Download"}
							</Button>
						) : null}

						<Button
							aria-label={`Dismiss notification for ${notification.projectName}`}
							onClick={() => dismissNotification(notification.index)}
							size="icon-sm"
							variant="ghost"
						>
							<X aria-hidden="true" />
						</Button>
					</li>
				))}
			</ul>
		</section>
	);
};

export default SimulationNotifications;

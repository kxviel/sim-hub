import { useState } from "react";
import { toast } from "sonner";
import { getRecord, getString } from "@/lib/parse";
import { saveAuthSession, useAuthSession } from "@/modules/Auth/auth.session";
import { getProjectDownloadPath } from "@/modules/Home/home.api";
import { downloadSimulationResult } from "@/modules/Home/useSimulationResults";

export type SimulationNotification = {
	downloadPath: string;
	index: number;
	projectName: string;
	success: boolean;
};

const getDownloadPath = (downloadLink: string) => {
	if (!downloadLink) {
		return "";
	}

	const normalizedLink = downloadLink.replace(/\/+$/, "");
	return normalizedLink.endsWith("/download")
		? normalizedLink
		: `${normalizedLink}/download`;
};

export const useSimulationNotifications = () => {
	const session = useAuthSession();
	const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
	const notifications = (
		session?.notifications ?? []
	).flatMap<SimulationNotification>((value, index) => {
		const notification = getRecord(value);
		const projectName = getString(
			notification?.project_name ?? notification?.projectName,
		);

		if (!projectName || !session) {
			return [];
		}

		const storedDownloadPath = getDownloadPath(
			session.downloadLinks[index] ?? "",
		);

		return [
			{
				downloadPath:
					storedDownloadPath ||
					getProjectDownloadPath(session.username, projectName),
				index,
				projectName,
				success: notification?.success === true,
			},
		];
	});

	const dismissNotification = (index: number) => {
		if (!session) {
			return;
		}

		saveAuthSession({
			...session,
			notifications: session.notifications.filter(
				(_, notificationIndex) => notificationIndex !== index,
			),
			downloadLinks: session.downloadLinks.filter(
				(_, downloadIndex) => downloadIndex !== index,
			),
		});
	};

	const downloadNotificationResult = async (
		notification: SimulationNotification,
	) => {
		if (!notification.success || !notification.downloadPath) {
			return;
		}

		setDownloadingIndex(notification.index);

		try {
			await downloadSimulationResult(
				notification.downloadPath,
				notification.projectName,
			);
			toast.success(`${notification.projectName} download started.`);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: `Could not download ${notification.projectName}.`,
			);
		} finally {
			setDownloadingIndex(null);
		}
	};

	return {
		dismissNotification,
		downloadNotificationResult,
		downloadingIndex,
		notifications,
	};
};

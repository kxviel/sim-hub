import { useSyncExternalStore } from "react";

const AUTH_SESSION_KEY = "simulationHub:session:v1";

export type AuthSession = {
	username: string;
	email: string;
	sshDomain: string;
	notifications: unknown[];
	downloadLinks: string[];
};

const readStoredSession = (): AuthSession | null => {
	try {
		const rawSession = window.localStorage.getItem(AUTH_SESSION_KEY);

		if (!rawSession) {
			return null;
		}

		const session = JSON.parse(rawSession) as Partial<AuthSession>;

		if (!session.username?.trim()) {
			return null;
		}

		return {
			username: session.username,
			email: session.email ?? "",
			sshDomain: session.sshDomain ?? "",
			notifications: Array.isArray(session.notifications)
				? session.notifications
				: [],
			downloadLinks: Array.isArray(session.downloadLinks)
				? session.downloadLinks.filter(
						(downloadLink): downloadLink is string =>
							typeof downloadLink === "string",
					)
				: [],
		};
	} catch {
		return null;
	}
};

let currentSession = readStoredSession();
const listeners = new Set<() => void>();

const emitSessionChange = () => {
	for (const listener of listeners) {
		listener();
	}
};

const subscribe = (listener: () => void) => {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
};

export const getAuthSession = () => currentSession;

export const saveAuthSession = (session: AuthSession) => {
	currentSession = session;
	try {
		window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
	} catch {
		// Keep the session available in memory when browser storage is unavailable.
	}
	emitSessionChange();
};

export const saveTemporaryAuthSession = (session: AuthSession) => {
	currentSession = session;
	try {
		window.localStorage.removeItem(AUTH_SESSION_KEY);
	} catch {
		// Temporary access remains available in memory for the current app run.
	}
	setTimeout(emitSessionChange, 0);
};

export const clearAuthSession = () => {
	currentSession = null;
	try {
		window.localStorage.removeItem(AUTH_SESSION_KEY);
	} catch {
		// Clearing the in-memory session is sufficient for the current app run.
	}
	emitSessionChange();
};

export const useAuthSession = () =>
	useSyncExternalStore(subscribe, getAuthSession, () => null);

window.addEventListener("storage", (event) => {
	if (event.key !== AUTH_SESSION_KEY) {
		return;
	}

	currentSession = readStoredSession();
	emitSessionChange();
});

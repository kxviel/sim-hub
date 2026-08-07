import { type ChangeEvent, useState } from "react";
import { getApiBaseUrl, resetApiBaseUrl, saveApiBaseUrl } from "@/lib/http";

const DEFAULT_MESSAGE =
	"Paste the active ngrok URL if the backend link changes.";

export const useApiEndpointSettings = () => {
	const [url, setUrl] = useState(getApiBaseUrl);
	const [message, setMessage] = useState(DEFAULT_MESSAGE);

	const handleUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
		setUrl(event.target.value);
		setMessage("Paste the full active ngrok URL, including https://");
	};

	const handleSave = () => {
		const savedUrl = saveApiBaseUrl(url);

		if (!savedUrl) {
			setUrl(resetApiBaseUrl());
			setMessage(
				"Use default selected. To change backend, paste the full https ngrok URL.",
			);
			return;
		}

		setUrl(savedUrl);
		setMessage("Saved. Try login or create account again.");
	};

	const handleReset = () => {
		setUrl(resetApiBaseUrl());
		setMessage(
			"Default proxy selected. If login fails, paste the active ngrok URL.",
		);
	};

	return {
		handleReset,
		handleSave,
		handleUrlChange,
		message,
		url,
	};
};

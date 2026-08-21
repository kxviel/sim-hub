import React from "react";
import ReactDOM from "react-dom/client";
import "./global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { routeTree } from "./routeTree.gen";

async function enableNativeBackdrop() {
	if (!isTauri()) return;

	try {
		const enabled = await invoke<boolean>("enable_native_backdrop");
		document.documentElement.classList.toggle("native-backdrop", enabled);
	} catch {
		document.documentElement.classList.remove("native-backdrop");
	}
}

void enableNativeBackdrop();

export const router = createRouter({ routeTree });
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
		},
	},
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("root") as HTMLElement;
ReactDOM.createRoot(rootElement).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	</React.StrictMode>,
);

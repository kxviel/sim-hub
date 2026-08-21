import { createRootRoute, Outlet } from "@tanstack/react-router";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	return (
		<div className="flex min-h-svh w-full flex-col overflow-x-hidden antialiased xl:h-svh xl:overflow-hidden">
			<Toaster position="top-right" richColors theme="system" closeButton />
			<a
				className="sr-only z-50 rounded bg-background px-3 py-2 font-medium shadow focus:fixed focus:top-3 focus:left-3 focus:not-sr-only"
				href="#main-content"
			>
				Skip to main content
			</a>
			<Header />
			<main
				className="min-h-0 flex-1 overflow-y-auto xl:overflow-hidden"
				id="main-content"
				tabIndex={-1}
			>
				<Outlet />
			</main>
		</div>
	);
}

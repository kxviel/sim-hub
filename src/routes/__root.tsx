import { createRootRoute, Outlet } from "@tanstack/react-router";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	return (
		<div className="flex min-h-svh w-full flex-col overflow-x-hidden antialiased xl:h-svh xl:overflow-hidden">
			<Toaster position="top-right" richColors theme="light" closeButton />
			<Header />
			<main
				className="min-h-0 flex-1 overflow-y-auto"
				id="main-content"
				tabIndex={-1}
			>
				<Outlet />
			</main>
		</div>
	);
}

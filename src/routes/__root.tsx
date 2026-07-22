import { createRootRoute, Outlet } from "@tanstack/react-router";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	return (
		<main className="antialiased flex h-svh w-full flex-col overflow-hidden">
			<Toaster position="top-right" richColors theme="light" closeButton />

			<Header />
			<div className="min-h-0 flex-1 overflow-y-auto">
				<Outlet />
			</div>
			{/* <Footer /> */}
		</main>
	);
}

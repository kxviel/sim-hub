import { createRootRoute, Outlet } from "@tanstack/react-router";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	return (
		<main className="antialiased flex min-h-svh w-full flex-col">
			<Toaster position="top-right" richColors theme="light" closeButton />

			<Header />
			<Outlet />
			<Footer />
		</main>
	);
}

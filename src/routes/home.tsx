import { createFileRoute } from "@tanstack/react-router";
import Home from "@/modules/Home/Home";

export const Route = createFileRoute("/home")({
	// beforeLoad: () => {
	// 	if (!getAuthSession()) {
	// 		throw redirect({ to: "/" });
	// 	}
	// },
	component: HomeComponent,
});

function HomeComponent() {
	return <Home />;
}

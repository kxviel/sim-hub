import { createFileRoute } from "@tanstack/react-router";
import Auth from "@/modules/Auth/Auth";

export const Route = createFileRoute("/")({
	component: AuthComponent,
});

function AuthComponent() {
	return <Auth />;
}

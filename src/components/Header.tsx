import { Link } from "@tanstack/react-router";
import { Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
	return (
		<header className="mx-auto flex w-full max-w-page shrink-0 justify-between gap-3 px-8 py-4 border-b border-gray-200">
			<Link
				to="/"
				className="min-w-0 wrap-break-word text-lg font-bold text-primary uppercase md:text-4xl flex gap-4 items-center"
			>
				<div className="p-3 bg-primary-foreground border border-primary rounded">
					<Ghost />
				</div>
				<span>Simulation Hub</span>
			</Link>

			<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
				<nav
					aria-label={"Simulation Hub"}
					className="flex flex-wrap items-center gap-x-4 gap-y-2"
				>
					<Button className="w-fit px-4 py-1">
						<Link to="/">Login</Link>
					</Button>
				</nav>
			</div>
		</header>
	);
};

export default Header;

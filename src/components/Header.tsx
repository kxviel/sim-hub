import { Link, useNavigate } from "@tanstack/react-router";
import { Ghost, LogOut } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { clearAuthSession, useAuthSession } from "@/modules/Auth/auth.session";

const Header = () => {
	const navigate = useNavigate();
	const session = useAuthSession();

	const handleLogout = () => {
		clearAuthSession();
		navigate({ to: "/" });
	};

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

			<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
				<nav
					aria-label={"Simulation Hub"}
					className="flex flex-wrap items-center gap-x-3 gap-y-2"
				>
					{session ? (
						<>
							<span className="text-sm text-muted-foreground">
								Signed in as{" "}
								<strong className="text-foreground">{session.username}</strong>
							</span>
							<Button variant="outline" onClick={handleLogout}>
								<LogOut data-icon="inline-start" />
								Logout
							</Button>
						</>
					) : (
						<Link to="/" className={buttonVariants()}>
							Login
						</Link>
					)}
				</nav>
			</div>
		</header>
	);
};

export default Header;

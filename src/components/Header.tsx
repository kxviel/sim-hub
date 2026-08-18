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
		<header className="shrink-0 border-gray-200 border-b bg-white">
			<div className="mx-auto flex min-h-16 w-full max-w-[1920px] items-center justify-between gap-3 px-3 sm:px-5 lg:px-6">
				<Link
					className="flex min-w-0 items-center gap-3 font-bold text-primary text-xl"
					to="/"
				>
					<span className="grid size-10 shrink-0 place-items-center rounded border border-primary bg-primary-foreground">
						<Ghost aria-hidden="true" className="size-5" />
					</span>
					<span className="truncate">Simulation Hub</span>
				</Link>

				<nav aria-label="Account" className="flex min-w-0 items-center gap-3">
					{session ? (
						<>
							<span className="hidden min-w-0 truncate text-muted-foreground text-sm md:inline">
								Signed in as{" "}
								<strong className="text-foreground">{session.username}</strong>
							</span>
							<Button
								aria-label="Log out"
								onClick={handleLogout}
								variant="outline"
							>
								<LogOut aria-hidden="true" data-icon="inline-start" />
								<span className="hidden sm:inline">Log Out</span>
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

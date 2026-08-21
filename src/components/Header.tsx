import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import { Button, buttonVariants } from "@/components/ui/button";
import { clearAuthSession, useAuthSession } from "@/modules/Auth/auth.session";

const Header = () => {
	const navigate = useNavigate();
	const session = useAuthSession();
	const isLoginPage = useRouterState({
		select: (state) => state.location.pathname === "/",
	});

	const handleLogout = () => {
		clearAuthSession();
		navigate({ to: "/" });
	};

	if (isLoginPage) {
		return null;
	}

	return (
		<header className="z-10 shrink-0 border-border border-b bg-card shadow-xs">
			<div className="mx-auto flex min-h-14 w-full max-w-[1920px] items-center justify-between gap-3 px-3 sm:px-5 lg:px-6">
				<Link
					className="flex min-w-0 items-center gap-2.5 font-bold text-primary text-lg tracking-tight"
					to="/"
				>
					<BrandMark className="size-9" />
					<span className="truncate">Simulation Hub</span>
				</Link>

				<nav aria-label="Account" className="flex min-w-0 items-center gap-2.5">
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

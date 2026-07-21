import { Button } from "@/components/ui/button";

const Header = () => {
	return (
		<header className="mx-auto flex w-full max-w-page justify-between gap-3 px-8 py-4 border-b border-gray-200">
			<a
				href="/"
				className="min-w-0 wrap-break-word text-lg font-bold text-primary uppercase md:text-4xl"
			>
				Simulation Hub
			</a>

			<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
				<nav
					aria-label={"Simulation Hub"}
					className="flex flex-wrap items-center gap-x-4 gap-y-2"
				>
					<Button className="w-fit rounded-full px-4 py-1">
						<a href="/">Login</a>
					</Button>
				</nav>
				{/* <Suspense fallback={null}>
					<LanguageToggle
						activeLocale={locale}
						ariaLabel={dictionary.navigation.languageSelection}
						localeLabels={dictionary.navigation.locales}
						className="ml-auto sm:ml-0"
					/>
				</Suspense> */}
			</div>
		</header>
	);
};

export default Header;

const currentYear = new Date().getFullYear();

const Footer = () => {
	return (
		<footer className="mx-auto flex w-full max-w-page shrink-0 items-center justify-center px-8 py-4 text-base border-t border-gray-200">
			<p className="text-gray-500">©{currentYear} Simulation Hub</p>
		</footer>
	);
};

export default Footer;

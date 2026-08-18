type Props = {
	title: string;
	icon: React.ReactElement;
};

const SectionTitle = ({ title, icon }: Props) => {
	return (
		<div className="mb-5 flex items-center gap-2 2xl:mb-7">
			<span aria-hidden="true" className="rounded bg-primary-foreground p-2">
				{icon}
			</span>
			<h2 className="text-pretty font-bold text-primary text-xl 2xl:text-2xl">
				{title}
			</h2>
		</div>
	);
};

export default SectionTitle;

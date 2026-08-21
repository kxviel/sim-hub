type Props = {
	title: string;
	icon: React.ReactElement;
};

const SectionTitle = ({ title, icon }: Props) => {
	return (
		<div className="mb-4 flex items-center gap-3 border-border border-b pb-3">
			<span
				aria-hidden="true"
				className="grid size-9 shrink-0 place-items-center rounded-md border border-primary/20 bg-primary/5 text-primary shadow-xs [&_svg]:size-4.5"
			>
				{icon}
			</span>
			<h2 className="text-pretty font-bold text-primary text-lg tracking-tight 2xl:text-xl">
				{title}
			</h2>
		</div>
	);
};

export default SectionTitle;

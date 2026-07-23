type Props = {
	title: string;
	icon: React.ReactElement;
};

const SectionTitle = ({ title, icon }: Props) => {
	return (
		<div className="flex items-center gap-2">
			<div className="p-2 bg-primary-foreground rounded">{icon}</div>
			<p className="text-2xl font-bold text-primary">{title}</p>
		</div>
	);
};

export default SectionTitle;

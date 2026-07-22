import { Ghost } from "lucide-react";

const SectionTitle = ({ title }: { title: string }) => {
	return (
		<div className="flex items-center gap-2">
			<div className="p-2 bg-primary-foreground rounded">
				<Ghost />
			</div>
			<p className="text-lg font-semibold text-primary">{title}</p>
		</div>
	);
};

export default SectionTitle;

import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

const BrandMark = ({
	className,
	...props
}: ComponentPropsWithoutRef<"span">) => (
	<span
		className={cn(
			"grid shrink-0 place-items-center rounded-md border border-border/80 bg-card/60 shadow-xs",
			className,
		)}
		{...props}
	>
		<img
			aria-hidden="true"
			alt=""
			className="size-[62%] object-contain"
			src="/favicon.svg"
		/>
	</span>
);

export default BrandMark;

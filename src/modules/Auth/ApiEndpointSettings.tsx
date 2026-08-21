import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApiEndpointSettings } from "@/modules/Auth/useApiEndpointSettings";

const ApiEndpointSettings = () => {
	const { handleReset, handleSave, handleUrlChange, message, url } =
		useApiEndpointSettings();

	return (
		<details className="group mb-5 rounded-md border border-border bg-background/60 text-sm">
			<summary className="cursor-pointer px-3 py-2.5 font-semibold text-foreground marker:text-primary focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2">
				Middle-logic URL
			</summary>
			<div className="space-y-3 border-border border-t p-3">
				<Input
					aria-label="Middle-logic URL"
					autoComplete="url"
					onChange={handleUrlChange}
					placeholder="https://your-current-ngrok-url.ngrok-free.dev"
					type="url"
					value={url}
				/>
				<div className="flex flex-wrap gap-2">
					<Button onClick={handleSave} size="sm" type="button">
						Save URL
					</Button>
					<Button
						onClick={handleReset}
						size="sm"
						type="button"
						variant="outline"
					>
						Use default
					</Button>
				</div>
				<p
					aria-live="polite"
					className="min-h-4 text-muted-foreground text-xs leading-relaxed"
				>
					{message}
				</p>
			</div>
		</details>
	);
};

export default ApiEndpointSettings;

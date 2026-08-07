import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApiEndpointSettings } from "@/modules/Auth/useApiEndpointSettings";

const ApiEndpointSettings = () => {
	const { handleReset, handleSave, handleUrlChange, message, url } =
		useApiEndpointSettings();

	return (
		<details className="mb-4 rounded border border-gray-200 p-3 text-sm">
			<summary className="cursor-pointer font-medium">Middle-logic URL</summary>
			<div className="mt-3 space-y-3">
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
				<p aria-live="polite" className="text-muted-foreground text-xs">
					{message}
				</p>
			</div>
		</details>
	);
};

export default ApiEndpointSettings;

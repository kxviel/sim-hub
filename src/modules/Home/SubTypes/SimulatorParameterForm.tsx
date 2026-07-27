import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	type SimulatorConfig,
	type SimulatorParameterValue,
	simulationTypeList,
} from "@/modules/Home/SimUtils";
import type { HomeState } from "@/modules/Home/useHome";

type SimulatorParameterFormProps = HomeState & {
	config: SimulatorConfig;
};

const getInitialValues = (config: SimulatorConfig) =>
	Object.fromEntries(
		config.fields.map((field) => [field.id, String(field.defaultValue ?? "")]),
	);

const SimulatorParameterForm = ({
	config,
	simType,
	isSubmitting,
	handleConfiguredSubmit,
}: SimulatorParameterFormProps) => {
	const [values, setValues] = useState<Record<string, string>>(() =>
		getInitialValues(config),
	);

	const updateValue = (fieldId: string, value: string | null) => {
		setValues((current) => ({ ...current, [fieldId]: value ?? "" }));
	};

	const handleSubmit = () => {
		const parameters: Record<string, SimulatorParameterValue> = {};

		for (const field of config.fields) {
			const rawValue = values[field.id]?.trim() ?? "";

			if (field.required && !rawValue) {
				toast.error(`${field.label} is required.`);
				return;
			}

			if (field.type === "number") {
				const numericValue = Number(rawValue);

				if (!Number.isFinite(numericValue)) {
					toast.error(`${field.label} must be a valid number.`);
					return;
				}

				if (field.min !== undefined && numericValue < field.min) {
					toast.error(`${field.label} must be at least ${field.min}.`);
					return;
				}

				if (field.max !== undefined && numericValue > field.max) {
					toast.error(`${field.label} must be at most ${field.max}.`);
					return;
				}

				parameters[field.id] = numericValue;
				continue;
			}

			parameters[field.id] = rawValue;
		}

		handleConfiguredSubmit(config, parameters);
	};

	const sections = [...new Set(config.fields.map((field) => field.section))];

	return (
		<div className="w-full space-y-5">
			<div className="space-y-1">
				<p>{config.description}</p>
				<p className="text-sm text-muted-foreground">
					{simulationTypeList.find((item) => item.value === simType)?.label}
				</p>
			</div>

			{sections.map((section) => (
				<fieldset
					className="space-y-4 rounded border border-gray-200 p-4"
					key={section}
				>
					<legend className="px-1 text-base font-semibold">{section}</legend>

					{config.fields
						.filter((field) => field.section === section)
						.map((field) => (
							<div className="space-y-2" key={field.id}>
								<Label htmlFor={field.id}>
									{field.label}
									{field.unit ? ` (${field.unit})` : ""}
								</Label>

								{field.type === "select" ? (
									<Select
										id={field.id}
										name={field.id}
										items={field.options ?? []}
										value={values[field.id] || null}
										disabled={isSubmitting}
										onValueChange={(value) => updateValue(field.id, value)}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder={`Select ${field.label.toLowerCase()}...`} />
										</SelectTrigger>
										<SelectContent alignItemWithTrigger>
											<SelectGroup>
												{field.options?.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														{option.label}
													</SelectItem>
												))}
											</SelectGroup>
										</SelectContent>
									</Select>
								) : (
									<Input
										id={field.id}
										name={field.id}
										type={field.type}
										value={values[field.id] ?? ""}
										min={field.min}
										max={field.max}
										step={field.step}
										disabled={isSubmitting}
										onChange={(event) =>
											updateValue(field.id, event.target.value)
										}
									/>
								)}

								<p className="text-sm text-muted-foreground">
									{field.description}
								</p>
							</div>
						))}
				</fieldset>
			))}

			<Button
				className="my-4 w-full py-4 text-lg"
				disabled={isSubmitting}
				onClick={handleSubmit}
			>
				{isSubmitting ? `Submitting ${config.label}...` : "Run Simulation"}
			</Button>
		</div>
	);
};

export default SimulatorParameterForm;

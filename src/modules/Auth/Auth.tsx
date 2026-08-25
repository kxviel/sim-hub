import BrandMark from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import ApiEndpointSettings from "@/modules/Auth/ApiEndpointSettings";
import { useAuthForm } from "@/modules/Auth/useAuthForm";

const Login = () => {
	const { form, handleSubmit, isRegistering, switchAuthMode } = useAuthForm();

	return (
		<section className="flex min-h-svh w-full bg-background px-4 py-8 sm:px-6">
			<div className="mx-auto my-auto w-full max-w-[28rem]">
				<div className="mb-5 flex items-center gap-3 px-1">
					<BrandMark className="size-11" />
					<div className="min-w-0">
						<p className="truncate font-bold text-foreground text-xl tracking-tight">
							Simulation Hub
						</p>
						<p className="text-muted-foreground text-sm">
							Research simulation workspace
						</p>
					</div>
				</div>

				<Card className="gap-0 py-0 shadow-lg shadow-foreground/5">
					<CardHeader className="px-5 pt-5 pb-0 sm:px-6 sm:pt-6">
						<CardTitle className="font-semibold text-xl tracking-tight">
							<h1>
								{isRegistering
									? "Create an Account"
									: "Sign in to Simulation Hub"}
							</h1>
						</CardTitle>
						<CardDescription className="mt-1">
							{isRegistering
								? "Register with your name, email, and password."
								: "Enter your credentials to login."}
						</CardDescription>
					</CardHeader>
					<CardContent className="px-5 pt-5 sm:px-6">
						<ApiEndpointSettings />
						<form onSubmit={handleSubmit}>
							<form.Subscribe selector={(state) => state.isSubmitting}>
								{(isSubmitting) => (
									<>
										<FieldGroup className="gap-4">
											<form.Field
												name="username"
												children={(field) => {
													const isInvalid =
														field.state.meta.isTouched &&
														!field.state.meta.isValid;

													return (
														<Field data-invalid={isInvalid}>
															<FieldLabel htmlFor={field.name}>
																Username
															</FieldLabel>
															<Input
																id={field.name}
																name={field.name}
																type="text"
																placeholder="researcher_name"
																autoComplete="username"
																value={field.state.value}
																onBlur={field.handleBlur}
																onChange={(event) =>
																	field.handleChange(event.target.value)
																}
																aria-invalid={isInvalid}
																disabled={isSubmitting}
															/>
															{isInvalid ? (
																<FieldError errors={field.state.meta.errors} />
															) : null}
														</Field>
													);
												}}
											/>

											{isRegistering ? (
												<form.Field
													name="email"
													children={(field) => {
														const isInvalid =
															field.state.meta.isTouched &&
															!field.state.meta.isValid;

														return (
															<Field data-invalid={isInvalid}>
																<FieldLabel htmlFor={field.name}>
																	Email
																</FieldLabel>
																<Input
																	id={field.name}
																	name={field.name}
																	type="email"
																	placeholder="researcher@institute.org"
																	autoComplete="email"
																	value={field.state.value}
																	onBlur={field.handleBlur}
																	onChange={(event) =>
																		field.handleChange(event.target.value)
																	}
																	aria-invalid={isInvalid}
																	disabled={isSubmitting}
																/>
																{isInvalid ? (
																	<FieldError
																		errors={field.state.meta.errors}
																	/>
																) : null}
															</Field>
														);
													}}
												/>
											) : null}

											<form.Field
												name="password"
												children={(field) => {
													const isInvalid =
														field.state.meta.isTouched &&
														!field.state.meta.isValid;

													return (
														<Field data-invalid={isInvalid}>
															<FieldLabel htmlFor={field.name}>
																Password
															</FieldLabel>
															<Input
																id={field.name}
																name={field.name}
																type="password"
																placeholder="Password"
																autoComplete={
																	isRegistering
																		? "new-password"
																		: "current-password"
																}
																value={field.state.value}
																onBlur={field.handleBlur}
																onChange={(event) =>
																	field.handleChange(event.target.value)
																}
																aria-invalid={isInvalid}
																disabled={isSubmitting}
															/>
															{isInvalid ? (
																<FieldError errors={field.state.meta.errors} />
															) : null}
														</Field>
													);
												}}
											/>

											{isRegistering ? (
												<form.Field
													name="confirmPassword"
													children={(field) => {
														const isInvalid =
															field.state.meta.isTouched &&
															!field.state.meta.isValid;

														return (
															<Field data-invalid={isInvalid}>
																<FieldLabel htmlFor={field.name}>
																	Confirm Password
																</FieldLabel>
																<Input
																	id={field.name}
																	name={field.name}
																	type="password"
																	placeholder="Password"
																	autoComplete="new-password"
																	value={field.state.value}
																	onBlur={field.handleBlur}
																	onChange={(event) =>
																		field.handleChange(event.target.value)
																	}
																	aria-invalid={isInvalid}
																	disabled={isSubmitting}
																/>
																{isInvalid ? (
																	<FieldError
																		errors={field.state.meta.errors}
																	/>
																) : null}
															</Field>
														);
													}}
												/>
											) : null}
										</FieldGroup>

										<Button
											type="submit"
											className="mt-4 w-full"
											disabled={isSubmitting}
										>
											{isSubmitting
												? isRegistering
													? "Creating account..."
													: "Signing in..."
												: isRegistering
													? "Create Account"
													: "Sign In"}
										</Button>
									</>
								)}
							</form.Subscribe>
						</form>
					</CardContent>
					<CardFooter className="flex-col gap-2 px-5 pt-4 pb-5 sm:px-6 sm:pb-6">
						<div className="text-center text-sm">
							{isRegistering ? "Already registered?" : "Need an account?"}{" "}
							<Button
								type="button"
								variant="link"
								className="h-auto p-0 underline-offset-4"
								onClick={switchAuthMode}
							>
								{isRegistering ? "Sign in" : "Register"}
							</Button>
						</div>
					</CardFooter>
				</Card>
			</div>
		</section>
	);
};

export default Login;

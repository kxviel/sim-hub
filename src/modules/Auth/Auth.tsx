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
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@/components/ui/input-group";
import { useAuthForm } from "@/modules/Auth/useAuthForm";

const Login = () => {
	const {
		form,
		handleSubmit,
		handleTemporaryAccess,
		isRegistering,
		switchAuthMode,
	} = useAuthForm();

	return (
		<section className="flex min-h-full w-full flex-col items-center bg-accent p-4">
			<Card className="my-auto w-full max-w-lg">
				<CardHeader>
					<CardTitle className="font-semibold">
						<h1>
							{isRegistering
								? "Create an Account"
								: "Sign in to Simulation Hub"}
						</h1>
					</CardTitle>
					<CardDescription>
						{isRegistering
							? "Register with your name, email, and password."
							: "Enter your credentials to login."}
					</CardDescription>
				</CardHeader>
				<CardContent>
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
												name="domain"
												children={(field) => {
													const isInvalid =
														field.state.meta.isTouched &&
														!field.state.meta.isValid;

													return (
														<Field data-invalid={isInvalid}>
															<FieldLabel htmlFor={field.name}>
																SSH Domain
															</FieldLabel>
															<InputGroup data-disabled={isSubmitting}>
																<InputGroupAddon>
																	<InputGroupText>ssh://</InputGroupText>
																</InputGroupAddon>
																<InputGroupInput
																	id={field.name}
																	name={field.name}
																	type="text"
																	placeholder="example.hpc.domain"
																	autoComplete="url"
																	value={field.state.value}
																	onBlur={field.handleBlur}
																	onChange={(event) =>
																		field.handleChange(event.target.value)
																	}
																	aria-invalid={isInvalid}
																	disabled={isSubmitting}
																/>
															</InputGroup>
															{isInvalid ? (
																<FieldError errors={field.state.meta.errors} />
															) : null}
														</Field>
													);
												}}
											/>
										) : null}

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
																<FieldError errors={field.state.meta.errors} />
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
																<FieldError errors={field.state.meta.errors} />
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

									{!isRegistering ? (
										<Button
											type="button"
											className="mt-2 w-full"
											disabled={isSubmitting}
											onClick={handleTemporaryAccess}
											variant="outline"
										>
											Continue without login
										</Button>
									) : null}
								</>
							)}
						</form.Subscribe>
					</form>
				</CardContent>
				<CardFooter className="flex-col gap-2">
					<div className="mt-4 text-center text-sm">
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
		</section>
	);
};

export default Login;

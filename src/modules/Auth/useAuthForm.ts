import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { type SubmitEvent, useState } from "react";
import { toast } from "sonner";
import * as z from "zod/mini";
import { useRegister, useSignIn } from "./auth.api";
import { saveAuthSession } from "./auth.session";

export type AuthMode = "login" | "register";

const DEMO_SSH_DOMAIN = "demo.hpc.domain";

const usernameField = z
	.string()
	.check(z.refine((value) => value.trim().length > 0, "Username is required."));
const loginPasswordField = z
	.string()
	.check(z.minLength(1, "Password is required."));
const registrationPasswordField = z
	.string()
	.check(
		z.minLength(1, "Password is required."),
		z.minLength(6, "Password must contain at least 6 characters."),
	);

const loginSchema = z.object({
	username: usernameField,
	email: z.string(),
	password: loginPasswordField,
	confirmPassword: z.string(),
});

const registerSchema = z
	.object({
		username: usernameField,
		email: z.email({
			error: ({ input }) =>
				input === "" ? "Email is required." : "Enter a valid email address.",
		}),
		password: registrationPasswordField,
		confirmPassword: z
			.string()
			.check(z.minLength(1, "Please confirm your password.")),
	})
	.check(
		z.refine((value) => value.password === value.confirmPassword, {
			error: "Passwords do not match.",
			path: ["confirmPassword"],
		}),
	);

type AuthFormValues = z.infer<typeof registerSchema>;

const defaultValues: AuthFormValues = {
	username: "",
	email: "",
	password: "",
	confirmPassword: "",
};

export const useAuthForm = () => {
	const navigate = useNavigate();

	const [authMode, setAuthMode] = useState<AuthMode>("login");

	const signIn = useSignIn();
	const register = useRegister();

	const isRegistering = authMode === "register";

	const resetMutations = () => {
		signIn.reset();
		register.reset();
	};

	const handleAuthError = (error: unknown) => {
		const message =
			error instanceof Error && error.message
				? error.message
				: "Unable to continue.";
		toast.error(message);
	};

	const handleAuthSuccess = (
		result: Awaited<ReturnType<typeof signIn.mutateAsync>>,
		message: string,
	) => {
		saveAuthSession(result.user);
		toast.success(message);
		navigate({ to: "/home" });
	};

	const form = useForm({
		defaultValues,
		validators: {
			onChange: isRegistering ? registerSchema : loginSchema,
		},
		onSubmit: async ({ value }) => {
			resetMutations();

			try {
				if (isRegistering) {
					const result = await register.mutateAsync({
						email: value.email.trim(),
						password: value.password,
						sshDomain: DEMO_SSH_DOMAIN,
						username: value.username.trim(),
					});
					handleAuthSuccess(result, "Account created.");
					return;
				}

				const result = await signIn.mutateAsync({
					password: value.password,
					username: value.username.trim(),
				});
				handleAuthSuccess(result, "Signed in.");
			} catch (error) {
				handleAuthError(error);
			}
		},
	});

	const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		event.stopPropagation();
		form.handleSubmit();
	};

	const switchAuthMode = () => {
		setAuthMode((currentMode) =>
			currentMode === "register" ? "login" : "register",
		);
		resetMutations();
		form.reset();
	};

	return {
		authMode,
		form,
		handleSubmit,
		isRegistering,
		switchAuthMode,
	};
};

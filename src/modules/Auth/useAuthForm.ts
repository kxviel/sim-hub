import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { type SubmitEvent, useState } from "react";
import { toast } from "sonner";
import * as z from "zod/mini";
import { useRegister, useSignIn } from "./auth.api";

export type AuthMode = "login" | "register";

const authFields = {
	username: z.string(),
	domain: z.string(),
	email: z.email({
		error: ({ input }) =>
			input === "" ? "Email is required." : "Enter a valid email address.",
	}),
	password: z
		.string()
		.check(
			z.minLength(1, "Password is required."),
			z.minLength(6, "Password must contain at least 6 characters."),
		),
	confirmPassword: z.string(),
};

const loginSchema = z.object(authFields);
const registerSchema = z
	.object({
		...authFields,
		username: z
			.string()
			.check(
				z.refine((value) => value.trim().length > 0, "Username is required."),
			),
		domain: z
			.string()
			.check(
				z.refine((value) => value.trim().length > 0, "SSH domain is required."),
			),
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
	domain: "",
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

	const handleAuthSuccess = (message: string) => {
		toast.success(message);
		void navigate({ to: "/home" });
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
					await register.mutateAsync({
						domain: value.domain.trim(),
						email: value.email.trim(),
						password: value.password,
						username: value.username.trim(),
					});
					handleAuthSuccess("Account created.");
					return;
				}

				await signIn.mutateAsync({
					email: value.email.trim(),
					password: value.password,
				});
				handleAuthSuccess("Signed in.");
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

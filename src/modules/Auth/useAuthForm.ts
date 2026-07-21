import { useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { useRegister, useSignIn } from "./auth.api";

export type AuthMode = "login" | "register";

export const useAuthForm = () => {
	const navigate = useNavigate();

	const [authMode, setAuthMode] = useState<AuthMode>("login");
	const [email, setEmail] = useState("");
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");

	const signIn = useSignIn();
	const register = useRegister();
	const isRegistering = authMode === "register";

	const isLoading = signIn.isPending || register.isPending;

	const resetMutations = () => {
		signIn.reset();
		register.reset();
	};

	const handleAuthError = (error: Error) => {
		toast.error(error.message || "Unable to continue.");
	};

	const handleAuthSuccess = (message: string) => {
		toast.success(message);
		navigate({ to: "/home" });
	};

	const switchAuthMode = () => {
		setAuthMode(isRegistering ? "login" : "register");
		resetMutations();
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		resetMutations();

		const body = {
			email,
			password,
		};

		if (isRegistering) {
			register.mutate(
				{ ...body, name },
				{
					onError: handleAuthError,
					onSuccess: () => handleAuthSuccess("Account created."),
				},
			);
			return;
		}

		signIn.mutate(body, {
			onError: handleAuthError,
			onSuccess: () => handleAuthSuccess("Signed in."),
		});
	};

	return {
		authMode,
		email,
		isLoading,
		isRegistering,
		name,
		password,

		handleSubmit,
		setEmail,
		setName,
		setPassword,
		switchAuthMode,
	};
};

import { useNavigate } from "@tanstack/react-router";
import { type SubmitEvent, useState } from "react";
import { toast } from "sonner";
import { useRegister, useSignIn } from "./auth.api";

export type AuthMode = "login" | "register";

export const useAuthForm = () => {
	const navigate = useNavigate();

	const [authMode, setAuthMode] = useState<AuthMode>("login");
	const [email, setEmail] = useState("");
	const [domain, setDomain] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

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

	const handleConfirmPassword = () => {
		return password === confirmPassword;
	};

	const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		resetMutations();

		const body = {
			email,
			password,
		};

		if (isRegistering && handleConfirmPassword()) {
			register.mutate(
				{ ...body, username, domain },
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
		domain,
		confirmPassword,
		isLoading,
		isRegistering,
		username,
		password,

		handleSubmit,
		setConfirmPassword,
		setDomain,
		setEmail,
		setUsername,
		setPassword,
		switchAuthMode,
	};
};

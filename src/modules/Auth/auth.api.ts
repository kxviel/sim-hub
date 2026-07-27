import { useMutation } from "@tanstack/react-query";
import http from "@/lib/http";
import type { AuthSession } from "@/modules/Auth/auth.session";

export type SignInBody = {
	username: string;
	password: string;
};

export type RegisterBody = SignInBody & {
	email: string;
	sshDomain: string;
};

type LoginResponse = {
	message?: string;
	notifications?: unknown[];
	download_links?: unknown[];
};

export type AuthResult = {
	message: string;
	user: AuthSession;
};

export const signInAPI = async (body: SignInBody): Promise<AuthResult> => {
	const { data } = await http.post<LoginResponse>("/login/", body);

	return {
		message: data.message ?? "Signed in.",
		user: {
			username: body.username,
			email: "",
			sshDomain: "",
			notifications: data.notifications ?? [],
			downloadLinks: (data.download_links ?? []).filter(
				(downloadLink): downloadLink is string =>
					typeof downloadLink === "string",
			),
		},
	};
};

export const registerAPI = async (body: RegisterBody): Promise<AuthResult> => {
	const { data } = await http.post<string>("/sign-up/", {
		username: body.username,
		email: body.email,
		password: body.password,
		ssh_domain: body.sshDomain,
	});

	return {
		message: typeof data === "string" ? data : "Account created.",
		user: {
			username: body.username,
			email: body.email,
			sshDomain: body.sshDomain,
			notifications: [],
			downloadLinks: [],
		},
	};
};

export const useSignIn = () =>
	useMutation({
		mutationFn: signInAPI,
	});

export const useRegister = () =>
	useMutation({
		mutationFn: registerAPI,
	});
